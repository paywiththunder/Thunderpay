"use client";
import React, { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { changePassword } from "@/services/auth";

export default function ChangePassword() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        try {
            const resp = await changePassword(currentPassword, newPassword);
            if (resp.success) {
                toast.success("Password changed successfully!");
                router.push("/profile");
            }
        } catch (err: any) {
            toast.error(err?.description || "Failed to change password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white w-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-6 shrink-0">
                <Link
                    href="/profile"
                    className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 hover:scale-105 transition-transform"
                >
                    <MdOutlineKeyboardDoubleArrowLeft />
                </Link>
                <h1 className="text-xl font-bold">Change Password</h1>
            </div>

            {/* Form Content */}
            <div className="flex-1 flex flex-col justify-between px-6 pb-6">
                <div className="space-y-6 max-w-md w-full mx-auto">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 block">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                            />
                            <button
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 block">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                            />
                            <button
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 block">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-4 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                            />
                            <button
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
                    className={`w-full py-4 rounded-full font-medium transition-all max-w-md mx-auto ${currentPassword && newPassword && confirmPassword && !isLoading
                            ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-white/5 active:scale-95"
                            : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
                        }`}
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
