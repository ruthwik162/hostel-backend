import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
// Optional: add email sending utility (e.g., nodemailer)
import nodemailer from "nodemailer";

// REGISTER USER
export const register = async (req, res) => {
  try {
    const { username, email, password, mobile, gender, role } = req.body;

    if (!username || !email || !password || !mobile || !gender || !role) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists!" });
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Optional: Send welcome email
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
      console.error("Email send error:", emailError.message);
    }

    return res.json({
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
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Optional: create a token and set cookie (if needed)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "Lax",
    });

    // ✅ Return user inside an object
    res.status(200).json({
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
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check Auth
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Successfully Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const formattedUsers = users.map((user) => ({
      ...user._doc,
      id: user._id.toString(), // match frontend expectations
    }));
    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER BY ID
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

// DELETE USER BY ID
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
