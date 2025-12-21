// components/AccountReadyScreen.tsx
"use client";
import React, { useEffect } from "react";
import { Copy } from "lucide-react";
import Ready from "../../../public/ready.png";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

const AccountReadyScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6 relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center w-full max-w-md z-10 mt-10">
        {/* Header Graphic */}
        <div className="mb-10">
          <Image width={100} height={100} src={Ready} alt="Ready" />
        </div>
        {/* Title & Subtitle */}
        <h1 className="text-3xl font-bold text-center mb-3 leading-tight tracking-tight">
          Congratulations! Your account is ready
        </h1>
        <p className="text-gray-400 text-center mb-12 text-lg">
          You're all set! Here's your new Thunder account.
        </p>

        {/* Account Details Card */}
        <div className="w-full bg-[#111111] border border-gray-800 rounded-2xl p-6 space-y-6">
          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-sm text-gray-500 font-medium block">
              Account Name
            </label>
            <p className="text-lg font-semibold text-white">
              Agbani Darego Durojaye
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800 w-full"></div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm text-gray-500 font-medium block">
                Account Number
              </label>
              <p className="text-lg font-semibold text-white tracking-wider">
                9068233532
              </p>
            </div>
            <button
              className="text-blue-500 hover:text-blue-400 transition-colors p-2 -mr-2 rounded-full hover:bg-blue-500/10"
              aria-label="Copy account number"
            >
              <Copy size={22} strokeWidth={2} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800 w-full"></div>

          {/* Account Tier */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm text-gray-500 font-medium block">
                Account Tier
              </label>
              <p className="text-lg font-semibold text-white">Tier 2</p>
            </div>
            <button className="w-11/12 py-2 md:w-1/2 md:py-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]">
              Upgrade for Higher Limits
            </button>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="w-full max-w-md mt-auto mb-4 z-10">
        <button onClick={() => router.push("/auth/login")} className="w-full py-3 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]">
          Continue
        </button>
      </div>
    </div>
  );
};

export default AccountReadyScreen;
