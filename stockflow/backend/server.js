
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "StockFlow Backend Running Successfully!",
        status: "OK"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Product CRUD routes
app.use("/api/products", productRoutes);

app.use("/api/settings", settingsRoutes);


// Handle unknown routes (keep this LAST)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Global error handler (keep this LAST)
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("StockFlow Backend Started");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Authentication API: /api/auth");
    console.log("Dashboard API: /api/dashboard");
    console.log("Products API: /api/products");
    console.log("Settings API: /api/settings");
    console.log("--------------------------------");
});
