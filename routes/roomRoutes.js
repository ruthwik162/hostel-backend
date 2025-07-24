import express from 'express';
import { createRoom, getAvailableRoomsByGenderAndPlan } from '../Controllers/roomController.js';

const router = express.Router();

// POST /api/rooms - Create a room
router.post('/', createRoom);
router.get('/available', getAvailableRoomsByGenderAndPlan);

export default router;
