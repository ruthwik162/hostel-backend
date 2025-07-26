import mongoose from "mongoose";
import { Room } from "./Room.js";
import User from "./User.js";
import { Block } from "./Block.js";


const saveOrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  address: String,
  gender: String,
  planId: { type: String, ref: 'Plan' },
  paymentId: String,
  totalAmount: Number,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Auto-cleanup middleware when a SaveOrder is deleted
saveOrderSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;

  try {
    // Find the linked user
    const user = await User.findById(doc.userId);
    if (!user) return;

    // Find and update Room
    const room = await Room.findById(user.roomId);
    if (room) {
      room.users = room.users.filter(u => u.toString() !== user._id.toString());
      if (room.users.length < room.capacity) room.occupied = false;
      await room.save();
    }

    // Find and update Block
    const block = await Block.findById(doc.blockId);
    if (block) {
      block.users = block.users.filter(u => u.toString() !== user._id.toString());
      await block.save();
    }

    // Delete the user itself
    await user.deleteOne();

    console.log(`✅ Cleaned up user ${user.email} from Room and Block after SaveOrder deletion.`);
  } catch (err) {
    console.error("❌ Error during SaveOrder cleanup:", err.message);
  }
});

export const SaveOrder = mongoose.model('SaveOrder', saveOrderSchema);
