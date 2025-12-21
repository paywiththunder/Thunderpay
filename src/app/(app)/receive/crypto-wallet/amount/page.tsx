"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

const amountOptions = [
  { amount: 1000, cashback: 10 },
  { amount: 2000, cashback: 20 },
  { amount: 3000, cashback: 30 },
  { amount: 5000, cashback: 50 },
  { amount: 10000, cashback: 100 },
  { amount: 20000, cashback: 200 },
];

function CryptoWalletAmount() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cryptoId = searchParams.get("crypto") || "usdt";
  const [amount, setAmount] = useState("");

  // Mock user data
  const userAccount = {
    name: "Agbani Darego Durojaye",
    accountNumber: "9068233532",
    avatar: "A",
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handlePay = () => {
    // TODO: Implement payment flow
    console.log("Pay with crypto:", cryptoId, "Amount:", amount);
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">From Crypto Wallet</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Fiat Account Section */}
        <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">
              {userAccount.avatar}
            </span>
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-white font-medium">
              {userAccount.name}
            </span>
            <span className="text-gray-400 text-sm">
              {userAccount.accountNumber}
            </span>
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Amount:</label>
          <div className="text-4xl font-bold text-white">
            ₦{amount ? parseFloat(amount).toLocaleString() : "0"}.00
          </div>
        </div>

        {/* Amount Buttons Grid */}
        <div className="grid grid-cols-3 gap-3">
          {amountOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => handleAmountSelect(option.amount)}
              className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${amount === option.amount.toString()
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : ""
                }`}
            >
              <span className="text-white font-bold text-base">
                ₦{option.amount.toLocaleString()}
              </span>
              <span className="text-gray-400 text-xs mt-1">
                ₦{option.cashback} Cashback
              </span>
            </button>
          ))}
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={!amount}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!amount
              ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
              : ""
            }`}
        >
          Pay
        </button>
      </div>
    </div>
  );
}

export default function CryptoWalletAmountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CryptoWalletAmount />
    </Suspense>
  );
}

