"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SignOutPage() {
    const router = useRouter();

    const handleSignOut = () => {
        // Remove auth token from local storage
        localStorage.removeItem("authToken");

        // Also clear any potential cookies by expiring them
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Redirect to login page
        router.push("/auth/login");
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background/Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div
                className="w-full max-w-md bg-[#0f1112] border border-[#222] rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <LogOut size={40} className="text-red-500 ml-1" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Sign Out</h1>
                <p className="text-gray-400 mb-8 max-w-[80%]">
                    Are you sure you want to log out of your account? You'll need to sign in again to access your wallet.
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-4 rounded-xl font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Yes, Sign Out
                    </button>

                    <button
                        onClick={handleCancel}
                        className="w-full py-4 rounded-xl font-medium bg-[#161616] text-white border border-[#2B2F33] hover:border-gray-600 transition-all cursor-pointer shadow-[inset_0_1px_4px_rgba(255,255,255,0.05)]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
