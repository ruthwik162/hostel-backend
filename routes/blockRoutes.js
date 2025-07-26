import express from 'express';
import { createBlock, getBlock, getBlockWithRoomDetails, getUsersInRoom, getUsersInRoomByRoomNumber } from '../Controllers/blockController.js';

const router = express.Router();

// POST /api/blocks - Create a block
router.post('/', createBlock);
router.get('/:blockId', getBlock);
router.get('/room-details/:blockId', getBlockWithRoomDetails);
router.get('/user/blocks/:blockId/:roomId', getUsersInRoom);
router.get("/:blockId/:roomNumber", getUsersInRoomByRoomNumber);


export default router;
