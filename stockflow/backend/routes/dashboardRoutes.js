const express = require("express");
const router = express.Router();

const authenticateUser =
    require("../middleware/authMiddleware");

const { getDashboard } =
    require("../controllers/dashboardController");

router.get("/", authenticateUser, getDashboard);

module.exports = router;
