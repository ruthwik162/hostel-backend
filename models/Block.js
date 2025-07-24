// models/Block.js
import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  blockId: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  totalRooms: Number,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  plans: [{ type: String }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  slots: [{ type: String }],

  // ✅ Add this field to store users in block
  users: [{
    name: String,
    email: String,
    mobile: String,
    address: String,
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
  }]
});

export const Block = mongoose.model('Block', blockSchema);
