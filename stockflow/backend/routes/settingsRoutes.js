
const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

router.use(authenticateUser);

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
