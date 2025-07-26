import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { SaveOrder } from '../models/SaveOrder.js';
import { Room } from '../models/Room.js';
import { Block } from '../models/Block.js';
import User from '../models/User.js';



export const createOrderAndAllocateRoom = async (req, res) => {
  try {
    let { name, email, mobile, address, gender, planId, paymentId, totalAmount } = req.body;

    if (!gender || !planId) {
      return res.status(400).json({ message: 'Gender and Plan are required' });
    }

    const normalizedGender = gender.trim().toLowerCase().startsWith('m') ? 'male' : 'female';
    const trimmedPlanId = planId.trim();

    // ✅ Find available room
    const room = await Room.findOne({
      gender: normalizedGender,
      plan: trimmedPlanId,
      $expr: {
        $lt: [
          { $size: { $ifNull: ["$users", []] } },
          "$capacity"
        ]
      }
    }).populate('block');

    if (!room) {
      return res.status(400).json({ message: 'No available room found for this gender and plan' });
    }

    // ✅ Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // 👉 Update existing user
      user.username = name.trim();
      user.mobile = mobile.trim();
      user.gender = normalizedGender;
      user.roomId = room._id;
      user.plan = trimmedPlanId;
      await user.save();
    } else {
      // 👉 Create new user
      user = await User.create({
        username: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        gender: normalizedGender,
        roomId: room._id,
        plan: trimmedPlanId
      });
    }

    // ✅ Create order
    const order = new SaveOrder({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      gender: normalizedGender,
      planId: trimmedPlanId,
      paymentId: paymentId?.trim(),
      totalAmount,
      roomId: room._id,
      blockId: room.block?._id || null,
      userId: user._id
    });

    await order.save();

    // ✅ Update room users
    if (!room.users.includes(user._id)) {
      room.users = room.users || [];
      room.users.push(user._id);
      if (room.users.length >= room.capacity) room.occupied = true;
      await room.save();
    }

    // ✅ Update block users
    if (room.block) {
      await Block.findByIdAndUpdate(room.block._id, {
        $addToSet: { users: user._id }
      });
    }

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nagaruthwikmerugu162@gmail.com',
        pass: 'xqsp vhlv lwca mksu'
      }
    });

    const mailOptions = {
      from: '"MRU Hostel" <nagaruthwikmerugu162@gmail.com>',
      to: user.email,
      subject: 'Room Booking Confirmation - MRU Hostel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #e0e0e0; padding: 20px; border-radius: 8px;">
          <h1 style="color: #4CAF50; text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">MRU Hostel Booking Confirmation</h1>
          
          <p style="font-size: 16px;">Dear <strong>${user.username}</strong>,</p>
          <p style="font-size: 16px;">Thank you for booking with MRU Hostel. Your booking has been confirmed!</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #2a2a2a;">
            <tr>
              <th style="padding: 12px; text-align: left; background-color: #4CAF50; color: white;">Details</th>
              <th style="padding: 12px; text-align: left; background-color: #4CAF50; color: white;">Information</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Booking ID</td>
              <td style="padding: 10px; border: 1px solid #444;">${order._id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Room Number</td>
              <td style="padding: 10px; border: 1px solid #444;">${room.roomNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Block</td>
              <td style="padding: 10px; border: 1px solid #444;">${room.block?.blockId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Plan</td>
              <td style="padding: 10px; border: 1px solid #444;">${trimmedPlanId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Total Amount</td>
              <td style="padding: 10px; border: 1px solid #444;">₹${totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Payment ID</td>
              <td style="padding: 10px; border: 1px solid #444;">${paymentId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #444;">Booking Date</td>
              <td style="padding: 10px; border: 1px solid #444;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
          
          <div style="background-color: #2a2a2a; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">Please keep this email for your records. Contact hostel administration for any queries.</p>
          </div>
          
          <p style="text-align: center; color: #aaa; font-size: 14px; margin-top: 30px;">
            © ${new Date().getFullYear()} MRU Hostel. All rights reserved.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: user ? 'Succesfully Booked, order saved and email sent' : 'Succesfully Booked, order saved and email sent',
      orderId: order._id,
      name: user.username,
      email: user.email,
      roomId: room._id,
      roomNumber: room.roomNumber,
      blockId: room.block?._id,
      blockName: room.block?.blockId,
      gender: normalizedGender,
      planId: trimmedPlanId
    });

  } catch (err) {
    console.error("❌ Error creating order and assigning room:", err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};



export const getOrdersWithUsers = async (req, res) => {
  try {
    const orders = await SaveOrder.find()
      .populate('roomId')
      .populate('blockId');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders
    });

  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

export const getOrdersWithUsersEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await SaveOrder.find({ email })
      .populate('roomId')
      .populate('blockId');

    if (orders.length === 0) {
      return res.status(404).json({ message: `No orders found for email: ${email}` });
    }

    const formattedOrders = orders.map(order => ({
      orderId: order._id,
      name: order.name,
      email: order.email,
      mobile: order.mobile,
      gender: order.gender,
      address: order.address,
      planId: order.planId,
      paymentId: order.paymentId,
      totalAmount: order.totalAmount,
      room: {
        id: order.roomId?._id,
        number: order.roomId?.roomNumber
      },
      block: {
        id: order.blockId?._id,
        name: order.blockId?.blockId
      },
      createdAt: order.createdAt
    }));

    res.status(200).json({
      message: `Orders for ${email} fetched successfully`,
      orders: formattedOrders
    });

  } catch (err) {
    console.error("❌ Error fetching orders by email:", err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};


export const deleteUserAndCleanup = async (req, res) => {
  try {
    const { email } = req.params;

    const order = await SaveOrder.findOneAndDelete({ email });

    if (!order) {
      return res.status(404).json({ message: "SaveOrder not found" });
    }

    res.status(200).json({ message: "User, order, room, and block cleaned up automatically." });

  } catch (err) {
    console.error("Error deleting user and cleanup:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
