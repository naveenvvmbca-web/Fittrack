const router = require("express").Router();
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const email = body("email").isEmail().withMessage("Valid email is required").normalizeEmail();
const password = body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters");

router.post("/register", [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters"),
  email, password
], validate, register);

router.post("/login", [email, password], validate, login);
router.get("/me", protect, me);

module.exports = router;