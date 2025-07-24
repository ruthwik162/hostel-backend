import mongoose from 'mongoose';
import { Room } from '../models/Room.js';

// ✅ Create Room
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, gender, plan, block } = req.body;

    if (!roomNumber || !gender || !plan || !block) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const room = new Room({
      roomNumber,
      gender: gender.toLowerCase(),
      plan: plan.trim(), // planId like "02"
      block: new mongoose.Types.ObjectId(block),
      occupied: false
    });

    await room.save();

    res.status(201).json({ message: 'Room created successfully', room });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
};

// ✅ Get Available Rooms by Gender and Plan
export const getAvailableRoomsByGenderAndPlan = async (req, res) => {
  try {
    const { gender, planId } = req.query;

    if (!gender || !planId) {
      return res.status(400).json({ message: 'Both gender and planId are required' });
    }

    const normalizedGender = gender.trim().toLowerCase().startsWith('m') ? 'male' : 'female';

    const availableRooms = await Room.find({
      occupied: false,
      gender: normalizedGender,
      plan: planId.trim()
    }).populate('block');

    res.status(200).json({
      message: 'Available rooms fetched successfully',
      rooms: availableRooms
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch available rooms', error: err.message });
  }
};
