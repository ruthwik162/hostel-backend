import express from 'express';
import { createBlock, getBlock, getBlockWithRoomDetails } from '../Controllers/blockController.js';

const router = express.Router();

// POST /api/blocks - Create a block
router.post('/', createBlock);
router.get('/:blockId', getBlock);
router.get('/room-details/:blockId', getBlockWithRoomDetails);

export default router;
