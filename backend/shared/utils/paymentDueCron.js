import cron from 'node-cron';
import Rider from '../../modules/rider/riderModel.js';
import SubscriptionPlan from '../../modules/admin/subscriptionPlanModel.js';
import Admin from '../../modules/admin/adminModel.js';
import Franchise from '../../modules/franchise/franchiseModel.js';
import FranchiseNotification from '../../modules/franchise/franchiseNotificationModel.js';
import { sendPushNotification } from './firebase.js';
import { sendSMS } from './smsService.js';

// Run every day at 9:00 AM — check for expired weekly plans
export const startPaymentDueCron = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ [CRON] Running weekly payment due check...');

    try {
      const now = new Date();

      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // Find ALL riders whose subscription ends today or ended before today
      const endOfToday = new Date(todayStart);
      endOfToday.setHours(23, 59, 59, 999);

      const expiredRiders = await Rider.find({
        subscriptionEnd: { $lte: endOfToday },
        subscriptionPlan: { $ne: null },
        status: { $in: ['active', 'approved', 'suspended'] } // Include suspended in case they were suspended for non-payment
      }).populate('subscriptionPlan');

      const weeklyExpiredRiders = expiredRiders.filter(rider => {
        if (!rider.subscriptionPlan || rider.subscriptionPlan.type !== 'Weekly') return false;

        // Calculate exact days passed since expiration
        const subEnd = new Date(rider.subscriptionEnd);
        subEnd.setHours(0, 0, 0, 0);

        const diffTime = todayStart.getTime() - subEnd.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Notify on Day 0 (7th day from start / exactly the day it expires), Day 7 (14th day), etc.
        // E.g. Plan starts June 9 -> Ends June 16.
        // June 16: diffDays = 0 -> Alert 1
        // June 23: diffDays = 7 -> Alert 2
        return diffDays >= 0 && diffDays % 7 === 0;
      });

      if (weeklyExpiredRiders.length === 0) {
        console.log('✅ [CRON] No weekly payment dues found for today.');
        return;
      }

      console.log(`⚠️ [CRON] Found ${weeklyExpiredRiders.length} riders with weekly payment due (Initial or Recurring 7-day alert).`);

      // Notify each rider
      for (const rider of weeklyExpiredRiders) {
        const planName = rider.subscriptionPlan.name || 'Weekly Plan';
        const amount = rider.subscriptionPlan.price || 0;

        const dueDateString = new Date(rider.subscriptionEnd).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const dueMessage = `Payment Due: Your ${planName} (₹${amount}) due on ${dueDateString} has expired. Please renew to continue using your vehicle.`;

        // Check if Rider belongs to a Franchise
        if (rider.franchise) {
          const franchise = await Franchise.findById(rider.franchise);
          if (franchise) {
            const franchiseDueMsg = `Payment Due: Rider ${rider.name || rider.phone} has an expired ${planName} (₹${amount}) due since ${dueDateString}. Please pay to avoid service interruption.`;

            // Push to Franchise Owner
            const franchiseToken = franchise.fcmToken || franchise.fcmTokenMobile;
            if (franchiseToken) {
              try {
                await sendPushNotification(
                  franchiseToken,
                  '⚠️ Rider Payment Due',
                  franchiseDueMsg,
                  { type: 'rider_payment_due', amount: amount.toString(), planName, dueDate: dueDateString, riderId: rider._id.toString() }
                );
                console.log(`📱 [CRON] Notification sent to franchise: ${franchise.phone}`);
              } catch (e) {
                console.error(`❌ [CRON] Failed to notify franchise ${franchise.phone}:`, e.message);
              }
            }

            // SMS to Franchise Owner
            try {
              await sendSMS(franchise.phone, franchiseDueMsg);
            } catch (e) {
              console.error(`❌ [CRON] SMS failed for franchise ${franchise.phone}:`, e.message);
            }

            // Create DB Notification for Franchise App
            try {
              await FranchiseNotification.create({
                franchiseId: franchise._id,
                title: 'Rider Payment Due',
                message: franchiseDueMsg,
                type: 'payment_due'
              });
            } catch (e) {
              console.error(`❌ [CRON] Failed to create DB notification for franchise ${franchise.phone}:`, e.message);
            }

            // Continue to send to Rider as well, so both are notified
          }
        }

        // Push notification to rider (if independent)
        const riderToken = rider.fcmToken || rider.fcmTokenMobile;
        if (riderToken) {
          try {
            await sendPushNotification(
              riderToken,
              '⚠️ Payment Due',
              `Your ${planName} (₹${amount}) due on ${dueDateString} has expired. Please renew now.`,
              { type: 'payment_due', amount: amount.toString(), planName, dueDate: dueDateString }
            );
            console.log(`📱 [CRON] Notification sent to rider: ${rider.name || rider.phone}`);
          } catch (e) {
            console.error(`❌ [CRON] Failed to notify rider ${rider.phone}:`, e.message);
          }
        }

        // SMS to rider (if independent)
        try {
          await sendSMS(rider.phone, dueMessage);
        } catch (e) {
          console.error(`❌ [CRON] SMS failed for ${rider.phone}:`, e.message);
        }
      }

      // Notify all SuperAdmins
      const admins = await Admin.find({ role: 'SuperAdmin' });
      const riderNames = weeklyExpiredRiders.map(r => r.name || r.phone).join(', ');
      const totalDue = weeklyExpiredRiders.reduce((sum, r) => sum + (r.subscriptionPlan?.price || 0), 0);

      for (const admin of admins) {
        if (admin.fcmToken) {
          try {
            await sendPushNotification(
              admin.fcmToken,
              `⚠️ ${weeklyExpiredRiders.length} Weekly Payment(s) Due`,
              `Total ₹${totalDue} pending from: ${riderNames.substring(0, 100)}`,
              { type: 'payment_due_admin', count: weeklyExpiredRiders.length.toString(), totalDue: totalDue.toString() }
            );
          } catch (e) {
            console.error('❌ [CRON] Admin notification failed:', e.message);
          }
        }
      }

      console.log(`✅ [CRON] Payment due notifications sent to ${weeklyExpiredRiders.length} riders + admins.`);
    } catch (error) {
      console.error('❌ [CRON] Payment due check failed:', error.message);
    }
  });

  console.log('✅ [CRON] Weekly payment due checker scheduled (daily at 9:00 AM)');

  // Run every day at 9:15 AM - check for admin assigned start date (8th day reminder)
  cron.schedule('15 9 * * *', async () => {
    console.log('⏰ [CRON] Running admin assigned start date 8-day check...');
    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // Find riders with an adminAssignedStartDate but no active subscriptionPlan
      const unpaidRiders = await Rider.find({
        adminAssignedStartDate: { $ne: null },
        subscriptionPlan: null, // No plan payment made yet
        status: { $nin: ['rejected', 'inactive'] } // Skip inactive/rejected
      });

      const ridersToNotify = unpaidRiders.filter(rider => {
        const startDate = new Date(rider.adminAssignedStartDate);
        startDate.setHours(0, 0, 0, 0);

        const diffTime = todayStart.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Send reminder exactly on the 7th day, 14th day, 21st day etc (diffDays % 7 === 0)
        return diffDays > 0 && diffDays % 7 === 0;
      });

      if (ridersToNotify.length === 0) {
        console.log('✅ [CRON] No 7-day admin start date dues found for today.');
        return;
      }

      console.log(`⚠️ [CRON] Found ${ridersToNotify.length} riders unpaid 7 days after admin start date.`);

      for (const rider of ridersToNotify) {
        const message = `Reminder: 7 days have passed since your assigned start date. Please complete your subscription payment to continue using the service.`;

        // Notify Rider
        const riderToken = rider.fcmToken || rider.fcmTokenMobile;
        if (riderToken) {
          try {
            await sendPushNotification(
              riderToken,
              '⚠️ Payment Required',
              message,
              { type: 'admin_start_date_due' }
            );
          } catch (e) {
            console.error(`❌ [CRON] Failed to notify rider ${rider.phone}:`, e.message);
          }
        }
        try {
          await sendSMS(rider.phone, message);
        } catch (e) {
          console.error(`❌ [CRON] SMS failed for ${rider.phone}:`, e.message);
        }

        // Notify Franchise if exists
        if (rider.franchise) {
          const franchise = await Franchise.findById(rider.franchise);
          if (franchise) {
            const franchiseMsg = `Reminder: Rider ${rider.name || rider.phone} has not completed plan payment 7 days after admin-assigned start date.`;
            const franchiseToken = franchise.fcmToken || franchise.fcmTokenMobile;
            if (franchiseToken) {
              try {
                await sendPushNotification(
                  franchiseToken,
                  '⚠️ Rider Payment Required',
                  franchiseMsg,
                  { type: 'admin_start_date_due', riderId: rider._id.toString() }
                );
              } catch (e) {
                console.error(`❌ [CRON] Failed to notify franchise ${franchise.phone}:`, e.message);
              }
            }
            try {
              await sendSMS(franchise.phone, franchiseMsg);
            } catch (e) {
              console.error(`❌ [CRON] SMS failed for franchise ${franchise.phone}:`, e.message);
            }
            try {
              await FranchiseNotification.create({
                franchiseId: franchise._id,
                title: 'Rider Payment Required',
                message: franchiseMsg,
                type: 'payment_due'
              });
            } catch (e) {
              console.error(`❌ [CRON] Failed to create DB notification for franchise ${franchise.phone}:`, e.message);
            }
          }
        }
      }

      console.log(`✅ [CRON] 8-day reminders sent to ${ridersToNotify.length} riders.`);
    } catch (error) {
      console.error('❌ [CRON] 8-day check failed:', error.message);
    }
  });

  console.log('✅ [CRON] Admin start date 8-day checker scheduled (daily at 9:15 AM)');
};
