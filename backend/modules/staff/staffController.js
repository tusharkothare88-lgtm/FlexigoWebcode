import Staff from './staffModel.js';

// @desc    Get all staff for a franchise
// @route   GET /api/v1/staff
export const getStaff = async (req, res) => {
  try {
    const franchiseId = req.query.franchiseId || req.franchise._id;
    const staff = await Staff.find({ franchise: franchiseId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new staff
// @route   POST /api/v1/staff/add
export const addStaff = async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    const franchiseId = req.franchise._id;

    // Default permissions based on role
    let permissions = 'Intake, Logistics';
    if (role === 'Partner') permissions = 'Full Root Access';
    else if (role === 'Manager') permissions = 'Ops, Fleet, Logistics';

    const staff = await Staff.create({
      name,
      phone,
      role,
      permissions,
      franchise: franchiseId,
    });

    res.status(201).json({ success: true, staff });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff status
// @route   PATCH /api/v1/staff/:id/status
export const updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete staff
// @route DELETE /api/v1/staff/:id
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
