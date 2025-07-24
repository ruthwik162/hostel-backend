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




export const createPlan = async (req, res) => {
  const plansArray = req.body;

  if (!Array.isArray(plansArray) || plansArray.length === 0) {
    return res.status(400).json({ message: "Request body must be a non-empty array of plans." });
  }

  // Validate each plan object
  const invalidPlans = plansArray.filter(plan =>
    !plan.id || !plan.name || !plan.description || !plan.features ||
    !plan.image || !plan.price_monthly || !plan.price_yearly
  );

  if (invalidPlans.length > 0) {
    return res.status(400).json({ message: "One or more plans are missing required fields." });
  }

  try {
    // Convert each plan into correct format (_id instead of id)
    const formattedPlans = plansArray.map(plan => ({
      _id: plan.id, // allow string-based custom _id
      name: plan.name,
      description: plan.description,
      features: plan.features,
      image: plan.image,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly
    }));

    const insertedPlans = await Plan.insertMany(formattedPlans, { ordered: false });

    res.status(201).json({
      message: "✅ Multiple plans inserted",
      plans: insertedPlans
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to insert plans",
      error: err.message
    });
  }
};

