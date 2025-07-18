import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  blockId: String,
  name: String,
  gender: String,
  totalRooms: Number,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  plans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  slots: [Boolean]
});

export const Block = mongoose.model('Block', blockSchema);