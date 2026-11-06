
const getOrganizationId = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Unable to find your organization.");
  }

  return data.organization_id;
};

// GET: Fetch all products belonging to the logged-in user's organization
const getProducts = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      products: data,
    });
  } catch (error) {
    console.error("Get Products Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST: Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold,
    } = req.body;

    if (
      !name?.trim() ||
      !sku?.trim() ||
      quantity === undefined ||
      cost_price === undefined ||
      selling_price === undefined ||
      low_stock_threshold === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product fields.",
      });
    }

    const numericFields = [
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold,
    ];

    if (
      numericFields.some(
        (value) => !Number.isFinite(Number(value)) || Number(value) < 0
      ) ||
      !Number.isInteger(Number(quantity)) ||
      !Number.isInteger(Number(low_stock_threshold))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid non-negative numbers. Quantity and threshold must be whole numbers.",
      });
    }

    const organizationId = await getOrganizationId(
      req.supabase,
      req.user.id
    );

    const product = {
      organization_id: organizationId,
      name: name.trim(),
      sku: sku.trim(),
      description: description?.trim() || "",
      quantity: Number(quantity),
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      low_stock_threshold: Number(low_stock_threshold),
    };

    const { data, error } = await req.supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "This SKU already exists in your organization.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product: data,
    });
  } catch (error) {
    console.error("Add Product Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT: Update an existing product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      description,
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold,
    } = req.body;

    if (
      !name?.trim() ||
      !sku?.trim() ||
      quantity === undefined ||
      cost_price === undefined ||
      selling_price === undefined ||
      low_stock_threshold === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product fields.",
      });
    }

    const numericFields = [
      quantity,
      cost_price,
      selling_price,
      low_stock_threshold,
    ];

    if (
      numericFields.some(
        (value) => !Number.isFinite(Number(value)) || Number(value) < 0
      ) ||
      !Number.isInteger(Number(quantity)) ||
      !Number.isInteger(Number(low_stock_threshold))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid non-negative numbers. Quantity and threshold must be whole numbers.",
      });
    }

    const updatedProduct = {
      name: name.trim(),
      sku: sku.trim(),
      description: description?.trim() || "",
      quantity: Number(quantity),
      cost_price: Number(cost_price),
      selling_price: Number(selling_price),
      low_stock_threshold: Number(low_stock_threshold),
    };

    const { data, error } = await req.supabase
      .from("products")
      .update(updatedProduct)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "This SKU already exists in your organization.",
        });
      }

      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: data,
    });
  } catch (error) {
    console.error("Update Product Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE: Remove a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      product: data,
    });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
