
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const supabase = createClient();

export default function InventoryPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadInventory = useCallback(async (token) => {
    const response = await fetch(
      "https://stockflow-backend-7rv2.onrender.com/api/products",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to load inventory.");
    }

    setProducts(result.products || []);
  }, []);

  useEffect(() => {
    async function initializeInventory() {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          router.replace("/login");
          return;
        }

        await loadInventory(session.access_token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeInventory();
  }, [router, loadInventory]);

  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity) <=
      Number(product.low_stock_threshold)
  );

  const inStockProducts = products.filter(
    (product) =>
      Number(product.quantity) >
      Number(product.low_stock_threshold)
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "low" &&
        Number(product.quantity) <=
          Number(product.low_stock_threshold)) ||
      (filter === "available" &&
        Number(product.quantity) >
          Number(product.low_stock_threshold));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <main className="p-8">Loading inventory...</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-7xl">

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Overview
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor product availability and stock levels.
            </p>
          </header>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Inventory Statistics */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total Products</p>
              <h2 className="mt-3 text-3xl font-bold">
                {products.length}
              </h2>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total Stock Units</p>
              <h2 className="mt-3 text-3xl font-bold">
                {totalStock}
              </h2>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Low Stock Products</p>
              <h2 className="mt-3 text-3xl font-bold text-red-600">
                {lowStockProducts.length}
              </h2>
            </div>

          </section>

          {/* Inventory Table */}
          <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm md:p-6">

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Stock Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor and review your inventory.
                </p>
              </div>

              <button
                onClick={() => router.push("/products")}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
              >
                Manage Products
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-5 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-[220px] flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="all">All Products</option>
                <option value="low">Low Stock</option>
                <option value="available">In Stock</option>
              </select>
            </div>

            {/* Product Table */}
            {filteredProducts.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No matching inventory products found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Available Quantity</th>
                      <th className="p-3">Low Stock Limit</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const isLowStock =
                        Number(product.quantity) <=
                        Number(product.low_stock_threshold);

                      return (
                        <tr
                          key={product.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium text-gray-900">
                            {product.name}
                          </td>

                          <td className="p-3">{product.sku}</td>

                          <td className="p-3 font-semibold">
                            {product.quantity}
                          </td>

                          <td className="p-3">
                            {product.low_stock_threshold}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
