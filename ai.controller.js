const Workout = require("../models/Workout");
const { askGemini } = require("../services/gemini.service");

exports.recommendation = async (req, res, next) => {
  try {
    const { focus } = req.body;
    const user = req.user;

    const recent = await Workout.find({ user: user._id }).sort({ completedAt: -1 }).limit(10).lean();

    const prompt = `You are a fitness planning assistant. Give safe, general fitness guidance, not medical diagnosis.
User profile:
Age: ${user.age || "not provided"}
Goal: ${user.fitnessGoal}
Experience: ${user.experience}
Requested focus: ${focus || "overall fitness"}
Recent workouts: ${JSON.stringify(recent.map(w => ({
      name: w.name, category: w.category, durationMinutes: w.durationMinutes, caloriesBurned: w.caloriesBurned
    })))}

Create a practical 7-day workout recommendation. Include warm-up, workout type, approximate duration, recovery/rest guidance, and beginner-friendly safety notes. Keep it concise and structured.`;

    const answer = await askGemini(prompt);
    res.json({ success: true, recommendation: answer });
  } catch (err) { next(err); }
};

exports.insights = async (req, res, next) => {
  try {
    const [summary] = await Workout.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: null, totalWorkouts: { $sum: 1 }, totalMinutes: { $sum: "$durationMinutes" },
        totalCalories: { $sum: "$caloriesBurned" }, averageDuration: { $avg: "$durationMinutes" }
      }}
    ]);

    const stats = summary || { totalWorkouts: 0, totalMinutes: 0, totalCalories: 0, averageDuration: 0 };

    const prompt = `Analyze these fitness tracking statistics and provide 4-6 useful, realistic insights:
${JSON.stringify(stats)}
User goal: ${req.user.fitnessGoal}
Experience: ${req.user.experience}
Do not diagnose medical conditions. Mention consistency, duration, calories and practical next steps where appropriate.`;

    const answer = await askGemini(prompt);
    res.json({ success: true, statistics: stats, insights: answer });
  } catch (err) { next(err); }
};