import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use _id directly for custom string IDs like "03"
  name: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: String, required: true },
  image: { type: String, required: true },
  price_monthly: { type: Number, required: true },
  price_yearly: { type: Number, required: true }
});

export const Plan = mongoose.model("Plan", planSchema);
