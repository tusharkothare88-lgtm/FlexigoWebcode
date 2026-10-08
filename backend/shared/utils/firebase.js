import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const serviceAccountName = 'firebase-key.json';
const serviceAccountPath = existsSync(join(process.cwd(), 'config', serviceAccountName))
  ? join(process.cwd(), 'config', serviceAccountName)
  : join(process.cwd(), 'backend', 'config', serviceAccountName);

if (existsSync(serviceAccountPath)) {
  try {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      console.log('🚀 Initializing Firebase for Project:', serviceAccount.project_id);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://flexigo-74574-default-rtdb.firebaseio.com/"
      });
      console.log('✅ Firebase Initialized Successfully');
    } else {
      console.log('ℹ️ Firebase already initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    console.error('Path attempted:', serviceAccountPath);
  }
} else {
  console.log('❌ CRITICAL: Firebase Service Account file NOT FOUND at:', serviceAccountPath);
}

// Allowed Platforms Configuration
export const ALLOWED_PLATFORMS = ["web", "app", "android", "ios"];

console.log('✅ Platforms Allowed:', ALLOWED_PLATFORMS.join(', '));

export const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) return;

  const message = {
    notification: {
      title,
      body,
    },
    data,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message (FCM):', error.message);

    if (error.message.includes('invalid_grant')) {
      console.error('💡 PRO TIP: This usually means your service account key is revoked or your server time is out of sync.');
      console.error('1. Check if you committed the key to GitHub (Google will revoke it automatically).');
      console.error('2. Run "w32tm /resync" on Windows to sync your clock.');
    }

    return { success: false, error: error.message };
  }
};

export default admin;
