
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// SIGNUP API
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, organization_name } = req.body;

        if (!name || !email || !password || !organization_name) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    organization_name
                }
            }
        });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(201).json({
            message: data.session
                ? "Registration successful"
                : "Registration successful. Please verify your email.",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Server error during signup"
        });
    }
});


// LOGIN API
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                message: error.message
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login"
        });
    }
});

module.exports = router;
