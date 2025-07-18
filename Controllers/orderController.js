import { SaveOrder } from '../models/SaveOrder.js';

import {Room} from '../models/Room.js'
import {Block}  from '../models/Block.js'

export const createOrderAndAllocateRoom = async (req, res) => {
  try {
    const { name, email, mobile, address, gender, planId, paymentId, totalAmount } = req.body;

    if (!gender || !planId) {
      return res.status(400).json({ message: 'Gender and Plan are required' });
    }

    const normalizedGender = gender.trim().toLowerCase().startsWith('m') ? 'male' : 'female';

    const room = await Room.findOne({ occupied: false, gender: normalizedGender, plan: planId }).populate('block');

    if (!room) {
      return res.status(400).json({ message: 'No available room found for this gender and plan' });
    }

    const order = new SaveOrder({
      name,
      email,
      mobile,
      address,
      gender: normalizedGender,
      planId,
      paymentId,
      totalAmount,
      roomId: room._id
    });

    await order.save();

    room.occupied = true;
    room.saveOrder = order._id;
    await room.save();

    res.status(201).json({
      message: 'Order saved and room allocated',
      roomId: room._id,
      roomNumber: room.roomNumber,
      block: room.block?.blockId,
      gender: normalizedGender,
      planId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};