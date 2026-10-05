const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: {
    type: String,
    enum: ["strength", "cardio", "flexibility", "hiit", "sports", "other"],
    default: "other"
  },
  durationMinutes: { type: Number, required: true, min: 1, max: 600 },
  caloriesBurned: { type: Number, default: 0, min: 0, max: 10000 },
  notes: { type: String, maxlength: 500 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

workoutSchema.index({ user: 1, completedAt: -1 });
workoutSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Workout", workoutSchema);