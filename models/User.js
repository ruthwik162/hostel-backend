import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  gender: String,
  role: { type: String, default: "user" },
});

const User = mongoose.model('User', userSchema);
export default User;
