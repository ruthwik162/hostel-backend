import mongoose from "mongoose";

const saveOrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  address: String,
  gender: String,
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  paymentId: String,
  totalAmount: Number,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  createdAt: { type: Date, default: Date.now }
});

export const SaveOrder = mongoose.model('SaveOrder', saveOrderSchema);