import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: String,
  occupied: { type: Boolean, default: false },
  gender: String,
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  saveOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SaveOrder' }
});

export const Room = mongoose.model('Room', roomSchema);