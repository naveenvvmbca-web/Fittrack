const router = require("express").Router();
const protect = require("../middleware/auth.middleware");
const { recommendation, insights } = require("../controllers/ai.controller");

router.use(protect);
router.post("/recommendation", recommendation);
router.get("/insights", insights);

module.exports = router;