import express from 'express';
import {
  getStaff,
  addStaff,
  updateStaffStatus,
  deleteStaff,
} from './staffController.js';
import { protectFranchise } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protectFranchise, getStaff);
router.post('/add', protectFranchise, addStaff);
router.patch('/:id/status', protectFranchise, updateStaffStatus);
router.delete('/:id', protectFranchise, deleteStaff);

export default router;
