import express from "express";
import { createPlan, getAllPlans, getPlanById } from "../Controllers/planController.js";
const router = express.Router();

router.get('/plans/:id', getPlanById);
router.get('/plans', getAllPlans); 
router.post('/plans', createPlan);

export default router;