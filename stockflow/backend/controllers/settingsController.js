
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

// GET: Retrieve organization settings
const getSettings = async (req, res) => {
  try {
    const organizationId = await getOrganizationId(
      req.supabase,
      req.user.id
    );

    const { data, error } = await req.supabase
      .from("organizations")
      .select("id, name, default_low_stock_threshold")
      .eq("id", organizationId)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error("Get Settings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT: Update the organization's default low-stock threshold
const updateSettings = async (req, res) => {
  try {
    const threshold = Number(req.body.default_low_stock_threshold);

    if (
      req.body.default_low_stock_threshold === undefined ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Default low-stock threshold must be a non-negative whole number.",
      });
    }

    const organizationId = await getOrganizationId(
      req.supabase,
      req.user.id
    );

    const { data, error } = await req.supabase
      .from("organizations")
      .update({
        default_low_stock_threshold: threshold,
      })
      .eq("id", organizationId)
      .select("id, name, default_low_stock_threshold")
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      settings: data,
    });
  } catch (error) {
    console.error("Update Settings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
