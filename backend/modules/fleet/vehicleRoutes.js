import express from 'express';
import {
  addVehicle,
  getVehicles,
  updateVehicleStatus,
  addMaintenanceLog,
  getAssignments,
  createAssignment,
  deleteVehicle
} from './vehicleController.js';
import { protectFranchise, protectFranchiseOrAdmin } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protectFranchiseOrAdmin, getVehicles);
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.post('/:id/maintenance', protectFranchise, addMaintenanceLog);
router.patch('/:id/status', protectFranchise, updateVehicleStatus);
router.delete('/:id', protectFranchiseOrAdmin, deleteVehicle);

export default router;
