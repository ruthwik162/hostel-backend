// models/ContactUs.js
import mongoose from 'mongoose';

const contactUsSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email:    { type: String, required: true },
  message:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ContactUs = mongoose.model('ContactUs', contactUsSchema);
