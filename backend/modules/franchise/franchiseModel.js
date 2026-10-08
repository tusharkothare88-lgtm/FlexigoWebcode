import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const FranchiseSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  hubName: String,
  city: String,
  aadhaarNumber: String,
  panNumber: String,

  // Business Details
  businessDetails: {
    name: { type: String },
    type: { type: String },
    location: { type: String },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    capacity: { type: Number, default: 0 },
  },

  // Hub Plan
  hubPlan: {
    id: { type: String },
    name: { type: String },
    price: { type: Number },
  },

  // Bank Details
  bankDetails: {
    beneficiary: { type: String },
    accountNo: { type: String },
    ifsc: { type: String },
  },

  // KYC
  kycDetails: {
    selfie: { type: String },
    aadhaarFront: { type: String },
    aadhaarBack: { type: String },
    panCard: { type: String },
    businessLicense: { type: String },
    certificate: { type: String },
    referenceName: { type: String, default: '' },
    referenceNumber: { type: String, default: '' },
    referenceName2: { type: String, default: '' },
    referenceNumber2: { type: String, default: '' },
    ekycVerified: { type: Boolean, default: false },
    ekycData: Object,
    attachments: { type: Array, default: [] },
  },

  kycStatus: {
    type: String,
    enum: ['uninitiated', 'pending', 'approved', 'rejected', 'inactive'],
    default: 'uninitiated',
  },

  // eKYC Top-level fields (to match QuickeKYC data structure in DB)
  ekycVerified: { type: Boolean, default: false },
  ekycData: Object,
  full_name: String,
  aadhaar_number: String,
  dob: String,
  gender: String,
  address: Object,
  face_status: Boolean,
  face_score: Number,
  zip: String,
  profile_image: String,
  has_image: Boolean,
  email_hash: String,
  mobile_hash: String,
  raw_xml: String,
  zip_data: String,
  care_of: String,
  share_code: String,
  mobile_verified: Boolean,
  aadhaar_pdf: String,
  status: String, // QuickeKYC status string like "success_aadhaar"

  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  otp: String,
  otpExpire: Date,
  fcmToken: {
    type: String,
    default: null
  },
  fcmTokenMobile: {
    type: String,
    default: null
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

// Hash password before saving
FranchiseSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
FranchiseSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Franchise', FranchiseSchema);
