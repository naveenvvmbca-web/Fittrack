const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  age: { type: Number, min: 13, max: 100 },
  fitnessGoal: {
    type: String,
    enum: ["weight_loss", "muscle_gain", "endurance", "general_fitness"],
    default: "general_fitness"
  },
  experience: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);