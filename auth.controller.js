const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function makeToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, age, fitnessGoal, experience } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email, password: hashed, age, fitnessGoal, experience
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: makeToken(user._id),
      user: {
        id: user._id, name: user.name, email: user.email,
        age: user.age, fitnessGoal: user.fitnessGoal, experience: user.experience
      }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      token: makeToken(user._id),
      user: {
        id: user._id, name: user.name, email: user.email,
        age: user.age, fitnessGoal: user.fitnessGoal, experience: user.experience
      }
    });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};