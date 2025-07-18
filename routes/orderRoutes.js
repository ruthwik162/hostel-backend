import express from "express";
import { createOrderAndAllocateRoom } from "../Controllers/orderController.js";


const router = express.Router();

router.post('/save-order',createOrderAndAllocateRoom);

export default router;