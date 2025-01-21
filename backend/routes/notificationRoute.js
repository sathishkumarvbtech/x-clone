import express from 'express';
import { deleteNotification, getNotification } from '../controllers/notificationController.js';
import { protectRoute } from '../middleware/protectRoute.js';
const router = express.Router();

router.get('/', protectRoute, getNotification)
router.delete('/', protectRoute, deleteNotification)

export default router;