import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { SaveOrder } from "../models/SaveOrder.js";
import nodemailer from "nodemailer";

// ✅ REGISTER USER
export const register = async (req, res) => {
  try {
    const { username, email, password, mobile, gender, role } = req.body;

    if (!username || !email || !password || !mobile || !gender || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      mobile,
      gender,
      role,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Mallareddy University" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Welcome to Mallareddy University!",
        html: `<p>Hello ${user.username},</p><p>Welcome to Mallareddy University. Your account was successfully created.</p>`,
      });
    } catch (emailError) {
      console.error("Email error:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ LOGIN USER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found or password missing" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CHECK AUTH STATUS
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Auth Check Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET USER BY ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User By ID Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ALL USERS & AUTO UPDATE FIELDS FROM SAVEORDER
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    for (const user of users) {
      const order = await SaveOrder.findOne({ userId: user._id });

      if (order) {
        const updateFields = {};

        if (!user.roomId && order.roomId) updateFields.roomId = order.roomId;
        if (!user.plan && order.planId) updateFields.plan = order.planId;
        if (!user.blockId && order.blockId) updateFields.blockId = order.blockId;

        if (Object.keys(updateFields).length > 0) {
          await User.findByIdAndUpdate(user._id, updateFields);
        }
      }
    }

    const updatedUsers = await User.find().select("-password");

    const formattedUsers = updatedUsers.map(user => ({
      ...user._doc,
      id: user._id.toString(),
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE USER
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, gender } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, mobile, gender },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        ...updatedUser._doc,
        id: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
