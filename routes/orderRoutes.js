import express from "express";
import { createOrderAndAllocateRoom, getOrdersWithUsers, getOrdersWithUsersEmail } from "../Controllers/orderController.js";


const router = express.Router();

router.post('/save-order',createOrderAndAllocateRoom);
router.get('/save-order',getOrdersWithUsers);
router.get('/save-order/:email',getOrdersWithUsersEmail)


export default router;