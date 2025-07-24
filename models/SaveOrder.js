import mongoose from "mongoose";

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

export const SaveOrder = mongoose.model('SaveOrder', saveOrderSchema);