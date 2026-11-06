
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Boxes, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        organization_name: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "https://stockflow-backend-7rv2.onrender.com/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        password: form.password,
                        organization_name: form.organization_name
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            if (result.session) {
                const { error: sessionError } =
                    await supabase.auth.setSession({
                        access_token: result.session.access_token,
                        refresh_token: result.session.refresh_token
                    });

                if (sessionError) {
                    throw sessionError;
                }

                router.push("/dashboard");
            } else {
                setMessage(
                    "Registration successful! Please verify your email, then log in."
                );
            }

        } catch (err) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                <div className="flex flex-col items-center mb-7">
                    <div className="bg-blue-600 p-3 rounded-xl text-white">
                        <Boxes size={30} />
                    </div>

                    <h1 className="text-3xl font-bold mt-3 text-slate-800">
                        StockFlow
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Create your inventory account
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Organization Name
                        </label>
                        <input
                            name="organization_name"
                            value={form.organization_name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your store name"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="Minimum 8 characters"
                                className="w-full border rounded-lg p-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    {message && (
                        <p className="text-green-600 text-sm">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 font-semibold">
                        Login
                    </Link>
                </p>

            </div>
        </main>
    );
}
