import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER USER
export const register = async (req, res) => {
  try {
    const { username, email, password, mobile, gender, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !mobile || !gender || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashed,
      mobile,
      gender,
      role,
    });

    // Issue token without expiration (never expires)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });

    // Return user data
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
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Issue token without expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
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
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
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

    const formattedUsers = updatedUsers.map((user) => ({
      ...user._doc,
      id: user._id.toString(),
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

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
