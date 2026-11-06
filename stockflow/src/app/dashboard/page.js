
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Boxes, LogOut, User, Package } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    // Create Supabase client only once
    const supabase = useMemo(() => createClient(), []);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    // Check authentication
    useEffect(() => {
        let active = true;

        const checkUser = async () => {
            try {
                const {
                    data: { user },
                    error
                } = await supabase.auth.getUser();

                if (!active) return;

                if (error || !user) {
                    router.replace("/login");
                    return;
                }

                setEmail(user.email || "");
                setLoading(false);

            } catch (error) {
                console.error("Authentication error:", error);

                if (active) {
                    router.replace("/login");
                }
            }
        };

        checkUser();

        return () => {
            active = false;
        };
    }, [router, supabase]);

    // Logout function
    const handleLogout = async () => {
        setLoggingOut(true);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            setLoggingOut(false);
            return;
        }

        router.replace("/login");
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <Boxes
                        size={40}
                        className="mx-auto text-blue-600 mb-4"
                    />
                    <p className="text-slate-600 font-medium">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6 md:p-10">

            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">

                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-3 rounded-xl text-white">
                            <Boxes size={28} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                StockFlow
                            </h1>
                            <p className="text-sm text-slate-500">
                                Inventory Management System
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                        <LogOut size={18} />
                        {loggingOut ? "Logging out..." : "Logout"}
                    </button>

                </header>

                {/* Welcome Section */}
                <section className="bg-white rounded-2xl shadow-sm p-8">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <User size={25} className="text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                Welcome to StockFlow!
                            </h2>

                            <p className="text-slate-500">
                                You are successfully logged in.
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-5 mt-5">
                        <p className="text-sm text-slate-500 mb-1">
                            Logged-in account
                        </p>

                        <p className="font-semibold text-slate-800">
                            {email}
                        </p>
                    </div>

                </section>

                {/* Temporary Feature Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <Package
                            size={30}
                            className="text-blue-600 mb-3"
                        />

                        <h3 className="font-semibold text-slate-800">
                            Product Management
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            Manage products, SKUs, prices and stock quantities.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <Boxes
                            size={30}
                            className="text-green-600 mb-3"
                        />

                        <h3 className="font-semibold text-slate-800">
                            Inventory Management
                        </h3>

                        <p className="text-sm text-slate-500 mt-2">
                            Monitor available stock and identify low-stock products.
                        </p>
                    </div>

                </section>

                <footer className="text-center text-sm text-slate-400 mt-10">
                    © 2026 StockFlow. Inventory Management System.
                </footer>

            </div>

        </main>
    );
}
