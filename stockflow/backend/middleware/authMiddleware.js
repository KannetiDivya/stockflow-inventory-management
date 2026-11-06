const { createClient } = require("@supabase/supabase-js");

const supabase = require("../config/supabase");

const authenticateUser = async (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        // Extract access token
        const token = authHeader.split(" ")[1];

        // Verify logged-in user
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token"
            });
        }

        // Store authenticated user
        req.user = data.user;

        // Create a database client using the user's JWT
        req.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Continue to the requested route
        next();

    } catch (error) {
        console.error("Authentication Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

// Export middleware
module.exports = authenticateUser;
