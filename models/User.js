import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  gender: String,
  role: { type: String, default: "user" },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String, ref: 'Plan' },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },

});

const User = mongoose.model('User', userSchema);
export default User;
