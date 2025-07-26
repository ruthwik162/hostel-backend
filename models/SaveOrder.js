import mongoose from "mongoose";
import { Room } from "./Room.js";
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

// ✅ Hook that runs after a SaveOrder is deleted
saveOrderSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      const user = await User.findById(doc.userId);
      const room = await Room.findById(doc.roomId);
      const block = await Block.findById(doc.blockId);

      // ❌ Remove from Room
      if (room && user) {
        room.users = room.users.filter(id => id.toString() !== user._id.toString());
        room.occupied = room.users.length >= room.capacity;
        await room.save();
      }

      // ❌ Remove from Block
      if (block && user) {
        block.users = block.users.filter(id => id.toString() !== user._id.toString());
        await block.save();
      }

      // ❌ Delete User
      if (user) {
        await user.deleteOne();
      }

      console.log("✅ Cleanup completed for deleted SaveOrder:", doc.email);
    } catch (err) {
      console.error("❌ Error during post-delete cleanup:", err);
    }
  }
});

export const SaveOrder = mongoose.model('SaveOrder', saveOrderSchema);
