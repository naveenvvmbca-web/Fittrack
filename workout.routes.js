const router = require("express").Router();
const { body } = require("express-validator");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const controller = require("../controllers/workout.controller");

router.use(protect);

router.post("/", [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Workout name is required"),
  body("category").optional().isIn(["strength", "cardio", "flexibility", "hiit", "sports", "other"]),
  body("durationMinutes").isInt({ min: 1, max: 600 }).withMessage("Duration must be 1-600 minutes"),
  body("caloriesBurned").optional().isFloat({ min: 0, max: 10000 })
], validate, controller.create);

router.get("/", controller.list);
router.get("/stats", controller.stats);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;