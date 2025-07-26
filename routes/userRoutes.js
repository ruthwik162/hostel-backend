import express from "express";
import {
  register,
  login,
  isAuth,
  logout,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById,
} from "../Controllers/userController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/is-auth",authUser, isAuth);
router.get("/logout", logout);

// Users
router.get("/all", getAllUsers); // frontend: axios.get('/user/all')
router.put("/register/:id", updateUser); // frontend: axios.put('/user/register/:id')
router.delete("/register/:id", deleteUser); // frontend: axios.delete('/user/register/:id')
router.get("/register/:id", getUserById);

export default router;
