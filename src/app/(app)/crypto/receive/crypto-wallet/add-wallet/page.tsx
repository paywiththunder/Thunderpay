"use client";
import React from "react";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import WalletForm from "@/components/payment/WalletForm";

export default function AddWalletPage() {
    return (
        <div className="bg-black text-white min-h-screen flex flex-col">
            <div className="max-w-md mx-auto w-full pt-6 px-4 pb-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center mb-8 relative">
                    <Link
                        href="/crypto/receive/crypto-wallet"
                        className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 absolute left-0 z-10"
                    >
                        <MdOutlineKeyboardDoubleArrowLeft />
                    </Link>
                    <h1 className="w-full text-center text-xl font-semibold">Add New Wallet</h1>
                </div>

                {/* Introduction */}
                <div className="mb-8 text-center space-y-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                        Expand Your Portfolio
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Create a new crypto wallet instantly to start sending, receiving, and trading assets.
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    {/* Decorative background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <WalletForm />
                </div>

                {/* Info Note */}
                <div className="mt-8 text-center text-xs text-gray-500 max-w-xs mx-auto">
                    By creating a wallet, you agree to our Terms of Service and Privacy Policy. Wallets are secured by industry-standard encryption.
                </div>
            </div>
        </div>
    );
}
