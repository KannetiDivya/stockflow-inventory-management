
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const supabase = createClient();

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get the logged-in user and session
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          router.replace("/login");
          return;
        }

        setUser(session.user);

        // Request dashboard statistics from Express
        const response = await fetch(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load dashboard");
        }

        setDashboard(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        Loading dashboard...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 text-red-600">
        {error}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-6xl">

          {/* Dashboard Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              StockFlow Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome, {user?.email}
            </p>
          </header>

          {/* Dashboard Statistics */}
          <section className="grid gap-6 md:grid-cols-3">

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Total Products
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {dashboard?.totalProducts ?? 0}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Total Stock Quantity
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                {dashboard?.totalStock ?? 0}
              </h2>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">
                Low Stock Products
              </p>

              <h2 className="mt-3 text-3xl font-bold text-red-600">
                {dashboard?.lowStockCount ?? 0}
              </h2>
            </div>

          </section>

          {/* Low Stock Alerts */}
          <section className="mt-8 rounded-xl bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-semibold">
              Low Stock Alerts
            </h2>

            {dashboard?.lowStockProducts?.length > 0 ? (
              <div className="overflow-x-auto">

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Threshold</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.lowStockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b"
                      >
                        <td className="p-3">
                          {product.name}
                        </td>

                        <td className="p-3">
                          {product.sku}
                        </td>

                        <td className="p-3">
                          {product.quantity}
                        </td>

                        <td className="p-3">
                          {product.low_stock_threshold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            ) : (
              <p className="text-gray-500">
                No low-stock products found.
              </p>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}
