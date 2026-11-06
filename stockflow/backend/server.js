
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "StockFlow Backend Running Successfully!",
        status: "OK"
    });
});

// Authentication APIs
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`StockFlow Backend running on port ${PORT}`);
});
