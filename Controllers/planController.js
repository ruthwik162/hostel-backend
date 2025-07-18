import { Plan } from "../models/Plan.js";

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: "Error fetching plans", error: err.message });
  }
};

// Get plan by ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ message: "Error fetching plan", error: err.message });
  }
};


// POST: Create a single plan (with optional custom _id)
export const createPlan = async (req, res) => {
  const { id, name, description, features, image, price_monthly, price_yearly } = req.body;

  // Basic validation
  if (!name || !description || !features || !image || !price_monthly || !price_yearly) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newPlanData = {
  _id: id,
  name,
  description,
  features,
  image,
  price_monthly,
  price_yearly
  };

  // Optional: Add custom _id if provided
  if (id) {
    newPlanData._id = id;
  }

  try {
    const newPlan = new Plan(newPlanData);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(400).json({ message: "Failed to save plan", error: err.message });
  }
};
