const getDashboard = async (req, res) => {
    try {
        // Step 1: Get logged-in user's organization
        const { data: profile, error: profileError } =
            await req.supabase
                .from("profiles")
                .select("organization_id")
                .eq("id", req.user.id)
                .single();

        if (profileError || !profile) {
            return res.status(404).json({
                message: "Organization profile not found"
            });
        }

        // Step 2: Get organization's stock threshold
        const { data: organization, error: orgError } =
            await req.supabase
                .from("organizations")
                .select("default_low_stock_threshold")
                .eq("id", profile.organization_id)
                .single();

        if (orgError || !organization) {
            return res.status(404).json({
                message: "Organization not found"
            });
        }

        // Step 3: Fetch products
        const { data: products, error: productError } =
            await req.supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

        if (productError) {
            return res.status(400).json({
                message: productError.message
            });
        }

        // Step 4: Calculate dashboard statistics
        const defaultThreshold =
            organization.default_low_stock_threshold ?? 5;

        const totalProducts = products.length;

        const totalStock = products.reduce(
            (sum, product) => sum + Number(product.quantity || 0),
            0
        );

        // Step 5: Find low-stock products
        const lowStockProducts = products.filter(product => {
            const threshold =
                product.low_stock_threshold ?? defaultThreshold;

            return product.quantity <= threshold;
        });

        // Step 6: Send response
        return res.status(200).json({
            success: true,
            totalProducts,
            totalStock,
            lowStockCount: lowStockProducts.length,
            lowStockProducts
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            message: "Failed to retrieve dashboard data"
        });
    }
};

module.exports = { getDashboard };
