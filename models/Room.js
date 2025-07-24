import mongoose from "mongoose";

// models/Room.js
const roomSchema = new mongoose.Schema({
  roomNumber: String,
  occupied: { type: Boolean, default: false },
  gender: String,
  capacity: { type: Number, default: 5 }, // ✅ Add this line
  plan: { type: String, ref: 'Plan' },
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  saveOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SaveOrder' },
  occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  user: {
    name: String,
    email: String,
    mobile: String,
    address: String
  }
});




export const Room = mongoose.model('Room', roomSchema);