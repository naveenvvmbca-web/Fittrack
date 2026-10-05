const Workout = require("../models/Workout");

exports.create = async (req, res, next) => {
  try {
    const workout = await Workout.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: "Workout created", workout });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { category, search, from, to, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (from || to) {
      filter.completedAt = {};
      if (from) filter.completedAt.$gte = new Date(from);
      if (to) filter.completedAt.$lte = new Date(to);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const [workouts, total] = await Promise.all([
      Workout.find(filter).sort({ completedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Workout.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: workouts,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ success: false, message: "Workout not found" });
    res.json({ success: true, workout });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = ["name", "category", "durationMinutes", "caloriesBurned", "notes", "completedAt"];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates, { new: true, runValidators: true }
    );
    if (!workout) return res.status(404).json({ success: false, message: "Workout not found" });
    res.json({ success: true, message: "Workout updated", workout });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ success: false, message: "Workout not found" });
    res.json({ success: true, message: "Workout deleted" });
  } catch (err) { next(err); }
};

exports.stats = async (req, res, next) => {
  try {
    const [summary] = await Workout.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: null,
        totalWorkouts: { $sum: 1 },
        totalMinutes: { $sum: "$durationMinutes" },
        totalCalories: { $sum: "$caloriesBurned" },
        averageDuration: { $avg: "$durationMinutes" }
      }}
    ]);

    const byCategory = await Workout.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 }, calories: { $sum: "$caloriesBurned" } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalWorkouts: summary?.totalWorkouts || 0,
        totalMinutes: summary?.totalMinutes || 0,
        totalCalories: summary?.totalCalories || 0,
        averageDuration: Number((summary?.averageDuration || 0).toFixed(2)),
        byCategory
      }
    });
  } catch (err) { next(err); }
};