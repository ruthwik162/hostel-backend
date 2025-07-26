// controllers/blockController.js

import { Block } from "../models/Block.js";
import { Plan } from "../models/Plan.js";
import { Room } from "../models/Room.js";


export const createBlock = async (req, res) => {
  try {
    const { blockId, name, gender, totalRooms, plans } = req.body;

    // Check if block already exists
    const existingBlock = await Block.findOne({ blockId });
    if (existingBlock) {
      return res.status(400).json({ error: "Block ID already exists" });
    }

    // Fetch plan documents using _id
    const plansFromDb = await Plan.find({ _id: { $in: plans } });

    if (plansFromDb.length !== plans.length) {
      return res.status(400).json({ error: "One or more plans are invalid" });
    }

    // Create new block
    const newBlock = new Block({
      blockId,
      name,
      gender,
      totalRooms,
      plans: plansFromDb.map(p => p._id),
    });

    await newBlock.save();

    const rooms = [];

    const roomsPerPlan = Math.floor(totalRooms / plansFromDb.length);
    let roomCounter = 1;

    for (const plan of plansFromDb) {
      for (let i = 1; i <= roomsPerPlan; i++) {
        const roomNumber = `${blockId}-${plan._id.slice(-3)}-${i}`;
        const room = new Room({
          roomNumber,
          gender,
          occupied: false,
          plan: plan._id,
          block: newBlock._id,
        });
        await room.save();
        rooms.push(room._id);
        roomCounter++;
      }
    }

    // Update block with room references
    newBlock.rooms = rooms;
    await newBlock.save();

    res.status(201).json({
      message: `✅ Block "${blockId}" created with ${roomCounter - 1} rooms`,
      block: newBlock,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


export const getBlock = async (req, res) => {
try {
    const { blockId } = req.params;

    const block = await Block.findOne({ blockId })
      .populate({
        path: 'users',
        populate: ['room', 'plan'],
      })
      .populate('rooms');

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({ block });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// controllers/blockController.js
export const getBlockWithRoomDetails = async (req, res) => {
  try {
    const { blockId } = req.params;

    const block = await Block.findOne({ blockId });
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }

    const rooms = await Room.find({ block: block._id })
      .populate({
        path: 'users',
        select: 'username email', // populate user info
      })
      .populate('plan');

    const roomData = rooms.map((room) => ({
      _id: room._id,
      roomNumber: room.roomNumber,
      occupied: room.users.length > 0,
      gender: room.gender,
      planId: room.plan?._id || '',
      planName: room.plan?.name || '',
      occupantName: room.users[0]?.username || null,
      occupantEmail: room.users[0]?.email || null
    }));

    res.status(200).json({
      blockId: block.blockId,
      name: block.name,
      gender: block.gender,
      rooms: roomData,
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch block with room details',
      error: err.message
    });
  }
};

export const getUsersInRoom = async (req, res) => {
  try {
    const { blockId, roomId } = req.params;

    // Find the block
    const block = await Block.findOne({ blockId });
    if (!block) {
      return res.status(404).json({ error: "Block not found" });
    }

    // Find the room in that block
    const room = await Room.findOne({ _id: roomId, block: block._id }).populate({
      path: "users",
      select: "username email mobile gender bio",
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found in specified block" });
    }

    res.status(200).json({
      roomId: room._id,
      roomNumber: room.roomNumber,
      plan: room.plan,
      capacity: room.capacity,
      gender: room.gender,
      occupied: room.occupied,
      users: room.users,
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch users in room",
      message: err.message,
    });
  }
};

// controllers/blockController.js
export const getUsersInRoomByRoomNumber = async (req, res) => {
  try {
    const { blockId, roomNumber } = req.params;

    // ✅ Find the Block
    const block = await Block.findOne({ blockId });
    if (!block) {
      return res.status(404).json({ error: "Block not found" });
    }

    // ✅ Find the Room by roomNumber and block _id
    const room = await Room.findOne({ roomNumber, block: block._id })
      .populate({
        path: "users",
        select: "username email mobile gender bio",
      })
      .populate({
        path: "plan",
        select: "name price description", // or whatever fields you want from plan
      });

    if (!room) {
      return res.status(404).json({ error: "Room not found in specified block" });
    }

    res.status(200).json({
      roomNumber: room.roomNumber,
      gender: room.gender,
      capacity: room.capacity,
      occupied: room.occupied,
      plan: {
        _id: room.plan._id,
        name: room.plan.name,
        price: room.plan.price,
        description: room.plan.description,
      },
      users: room.users,
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch room users",
      message: err.message,
    });
  }
};
