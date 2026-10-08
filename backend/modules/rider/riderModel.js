import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const RiderSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'rider',
  },
  password: {
    type: String,
    required: false,
  },
  otp: String,
  otpExpire: Date,
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive'],
    default: 'pending',
  },
  kycDetails: {
    selfie: String,
    aadhaarFront: String,
    aadhaarBack: String,
    panCard: String,
    drivingLicense: String,
    ekycVerified: { type: Boolean, default: false },
    ekycData: Object,
    certificate: String,
    referenceName: { type: String, default: '' },
    referenceNumber: { type: String, default: '' },
    referenceName2: { type: String, default: '' },
    referenceNumber2: { type: String, default: '' },
    attachments: { type: Array, default: [] },
  },
  bankDetails: {
    accountName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    attachment: String,
  },
  name: String,
  email: String,
  isRegistered: {
    type: Boolean,
    default: false,
  },
  depositPaid: {
    type: Boolean,
    default: false,
  },
  addOff: {
    type: Number,
    default: 0,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['approved', 'active', 'paused', 'pending', 'completed', 'inactive', 'suspended', 'rejected'],
    default: 'pending',
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    default: null,
  },
  subscriptionStart: Date,
  subscriptionEnd: Date,
  adminAssignedStartDate: {
    type: Date,
    default: null
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
  },
  onboardedPlatform: {
    type: String,
    enum: ['Zepto', 'Zomato', 'Blinkit', 'Amazon', 'Instamart', 'Flipkart', 'Porter', 'Licious', ''],
    default: '',
  },
  fcmToken: {
    type: String,
    default: null
  },
  fcmTokenMobile: {
    type: String,
    default: null
  },
  lastLocation: {
    lat: Number,
    lng: Number,
    address: String,
    updatedAt: Date
  },
  currentSpeed: {
    type: Number,
    default: 0
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  activeDutyMinutes: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
RiderSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
RiderSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Rider', RiderSchema);
