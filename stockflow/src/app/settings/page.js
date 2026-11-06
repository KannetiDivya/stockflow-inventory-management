
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

const supabase = createClient();

export default function SettingsPage() {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          router.replace("/login");
          return;
        }

        setAccessToken(session.access_token);

        const response = await fetch(
          "http://localhost:5000/api/settings",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load settings.");
        }

        setOrganizationName(result.settings.name);

        setThreshold(
          String(result.settings.default_low_stock_threshold)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            default_low_stock_threshold: Number(threshold),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save settings.");
      }

      setThreshold(
        String(result.settings.default_low_stock_threshold)
      );

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 p-8">
          Loading settings...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mx-auto max-w-5xl">

          {/* Settings Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="mt-2 text-gray-600">
              Configure your organization's inventory preferences.
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
              {message}
            </div>
          )}

          {/* Organization Settings */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-gray-900">
              Organization Settings
            </h2>

            {/* Organization Name */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Organization Name
              </label>

              <input
                type="text"
                value={organizationName}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
              />

              <p className="mt-1 text-xs text-gray-500">
                Your organization name is displayed here.
              </p>
            </div>

            {/* Default Low Stock Threshold */}
            <form onSubmit={handleSubmit} className="mt-6">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Default Low-Stock Threshold
              </label>

              <input
                type="number"
                min="0"
                step="1"
                required
                value={threshold}
                onChange={(event) =>
                  setThreshold(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-sm text-gray-500">
                Products with a quantity at or below this number will
                be marked as low stock when they use the default threshold.
              </p>

              <button
                type="submit"
                disabled={saving || !accessToken}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>

            </form>

          </section>

        </div>
      </main>
    </div>
  );
}
