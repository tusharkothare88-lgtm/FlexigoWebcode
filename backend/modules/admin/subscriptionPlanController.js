import SubscriptionPlan from './subscriptionPlanModel.js';
import { getDateFilter } from './adminController.js';

// @desc    Get all subscription plans
// @route   GET /api/v1/admin/plans
export const getPlans = async (req, res) => {
  try {
    const { range } = req.query;
    const dateFilter = getDateFilter(range, 'createdAt');

    const plans = await SubscriptionPlan.find(dateFilter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new plan
// @route   POST /api/v1/admin/plans
export const createPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update plan
// @route   PATCH /api/v1/admin/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/v1/admin/plans/:id
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`ATTEMPTING DELETE: Plan ID ${id}`);
    const plan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!plan) {
      console.log(`DELETE FAILED: Plan ${id} not found`);
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    console.log(`DELETE SUCCESS: Plan ${id} removed from Registry`);
    res.status(200).json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.log(`DELETE ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
