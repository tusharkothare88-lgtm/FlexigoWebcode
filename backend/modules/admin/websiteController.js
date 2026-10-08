import WebsitePlan from './websitePlanModel.js';
import WebsiteContactInquiry from './websiteContactInquiryModel.js';
import WebsiteAbout from './websiteAboutModel.js';
import WebsitePressRelease from './websitePressReleaseModel.js';
import WebsiteContactInfo from './websiteContactInfoModel.js';

// --- Plans ---
export const getWebsitePlans = async (req, res) => {
  try {
    const plans = await WebsitePlan.find().sort({ order: 1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWebsitePlan = async (req, res) => {
  try {
    const plan = await WebsitePlan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsitePlan = async (req, res) => {
  try {
    const plan = await WebsitePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebsitePlan = async (req, res) => {
  try {
    await WebsitePlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Inquiries & Contact Info ---
export const getWebsiteInquiries = async (req, res) => {
  try {
    const inquiries = await WebsiteContactInquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitWebsiteInquiry = async (req, res) => {
  try {
    const inquiry = await WebsiteContactInquiry.create(req.body);
    res.status(201).json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await WebsiteContactInquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    await WebsiteContactInquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWebsiteContactInfo = async (req, res) => {
  try {
    let info = await WebsiteContactInfo.findOne();
    res.status(200).json({ success: true, info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsiteContactInfo = async (req, res) => {
  try {
    let info = await WebsiteContactInfo.findOneAndUpdate({}, req.body, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(200).json({ success: true, info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- About ---
export const getWebsiteAbout = async (req, res) => {
  try {
    let about = await WebsiteAbout.findOne();
    if (!about) {
      return res.status(200).json({ success: true, about: null });
    }
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsiteAbout = async (req, res) => {
  try {
    let about = await WebsiteAbout.findOneAndUpdate({}, req.body, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.status(200).json({ success: true, about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Press ---
export const getWebsitePressReleases = async (req, res) => {
  try {
    const releases = await WebsitePressRelease.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, releases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWebsitePressRelease = async (req, res) => {
  try {
    const release = await WebsitePressRelease.create(req.body);
    res.status(201).json({ success: true, release });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWebsitePressRelease = async (req, res) => {
  try {
    const release = await WebsitePressRelease.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, release });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebsitePressRelease = async (req, res) => {
  try {
    await WebsitePressRelease.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Press release deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
