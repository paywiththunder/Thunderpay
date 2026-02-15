"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HiOutlineQrCode,
    HiOutlineQuestionMarkCircle,
    HiOutlineBell,
} from "react-icons/hi2";

export default function AppHeader() {
    const [firstName, setFirstName] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        const savedName = localStorage.getItem("firstName");
        if (savedName) {
            setFirstName(savedName);
        }
    }, []);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex flex-col gap-5 w-full">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600/50 overflow-hidden">
                        {/* Placeholder for avatar */}
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
                    </div>
                    <h1 className="font-semibold text-lg">Hi {firstName}</h1>
                </div>
                <div className="flex gap-4 text-white">
                    <HiOutlineQrCode className="w-6 h-6" />
                    <HiOutlineQuestionMarkCircle className="w-6 h-6" />
                    <HiOutlineBell className="w-6 h-6" />
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-6 text-sm font-semibold">
                <Link
                    href="/crypto"
                    className={`${isActive("/crypto")
                        ? "text-white border-b-2 border-[#3B82F6] pb-1"
                        : "text-gray-400 hover:text-white transition-colors"
                        }`}
                >
                    Crypto
                </Link>
                <Link
                    href="/home"
                    className={`${isActive("/home")
                        ? "text-white border-b-2 border-[#3B82F6] pb-1"
                        : "text-gray-400 hover:text-white transition-colors"
                        }`}
                >
                    Cash
                </Link>
                <Link
                    href="/international"
                    className={`${isActive("/international")
                        ? "text-white border-b-2 border-[#3B82F6] pb-1"
                        : "text-gray-400 hover:text-white transition-colors"
                        }`}
                >
                    International
                </Link>
            </div>
        </div>
    );
}
