
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const supabase = createClient();
const API_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantity: "0",
  cost_price: "0",
  selling_price: "0",
  low_stock_threshold: "5",
};

export default function ProductsPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = useCallback(async (accessToken) => {
    const response = await fetch(`${API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to load products.");
    }

    setProducts(result.products || []);
  }, []);

  useEffect(() => {
    async function initializePage() {
      try {
        const {
          data: { session: currentSession },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !currentSession) {
          router.replace("/login");
          return;
        }

        setSession(currentSession);
        await loadProducts(currentSession.access_token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [router, loadProducts]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity: String(product.quantity ?? 0),
      cost_price: String(product.cost_price ?? 0),
      selling_price: String(product.selling_price ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!session) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        low_stock_threshold: Number(form.low_stock_threshold),
      };

      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save product.");
      }

      setSuccess(result.message);
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadProducts(session.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!session) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete product.");
      }

      setSuccess(result.message);
      await loadProducts(session.access_token);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          Loading products...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-7xl">

          {/* Products Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Products Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your inventory products in one place.
            </p>
          </header>

          {/* Error Message */}
          {error && !showForm && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          {/* Product Statistics */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Products
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Stock Quantity
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {products.reduce(
                  (total, product) =>
                    total + Number(product.quantity || 0),
                  0
                )}
              </p>
            </div>

          </section>

          {/* Products Table */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  All Products
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {products.length} product(s) in your inventory
                </p>
              </div>

              <button
                onClick={openAddForm}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              >
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  No products yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Add your first product to start managing your inventory.
                </p>

                <button
                  onClick={openAddForm}
                  className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="p-3 font-semibold">Product Name</th>
                      <th className="p-3 font-semibold">SKU</th>
                      <th className="p-3 font-semibold">Quantity</th>
                      <th className="p-3 font-semibold">Cost Price</th>
                      <th className="p-3 font-semibold">Selling Price</th>
                      <th className="p-3 font-semibold">Stock Status</th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const isLowStock =
                        Number(product.quantity) <=
                        Number(product.low_stock_threshold);

                      return (
                        <tr
                          key={product.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium text-gray-900">
                            {product.name}

                            {product.description && (
                              <p className="mt-1 max-w-xs truncate text-xs font-normal text-gray-500">
                                {product.description}
                              </p>
                            )}
                          </td>

                          <td className="p-3 text-gray-600">
                            {product.sku}
                          </td>

                          <td className="p-3 text-gray-700">
                            {product.quantity}
                          </td>

                          <td className="p-3 text-gray-700">
                            ₹{Number(product.cost_price).toFixed(2)}
                          </td>

                          <td className="p-3 text-gray-700">
                            ₹{Number(product.selling_price).toFixed(2)}
                          </td>

                          <td className="p-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                isLowStock
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditForm(product)}
                                className="rounded-md border border-blue-200 px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(product)}
                                className="rounded-md border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </section>

          {/* Add / Edit Product Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
              <div className="my-8 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h2>

                  <button
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="text-2xl text-gray-500 hover:text-gray-800"
                    aria-label="Close form"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Product Name *
                      </label>

                      <input
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        maxLength={150}
                        placeholder="Enter product name"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        SKU *
                      </label>

                      <input
                        name="sku"
                        value={form.sku}
                        onChange={handleInputChange}
                        required
                        maxLength={80}
                        placeholder="e.g. PROD-001"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter product description"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Quantity *
                      </label>

                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Low Stock Threshold *
                      </label>

                      <input
                        type="number"
                        name="low_stock_threshold"
                        value={form.low_stock_threshold}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Cost Price (₹) *
                      </label>

                      <input
                        type="number"
                        name="cost_price"
                        value={form.cost_price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Selling Price (₹) *
                      </label>

                      <input
                        type="number"
                        name="selling_price"
                        value={form.selling_price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setError("");
                      }}
                      className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                          ? "Update Product"
                          : "Save Product"}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
