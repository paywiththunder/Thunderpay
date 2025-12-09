"use client";
import React from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi2";

export interface PaymentOption {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  balance?: string;
  cryptoAmount?: string;
  value: string;
  type: "fiat" | "crypto";
}

interface PaymentMethodProps {
  onBack: () => void;
  onSelect: (paymentMethod: PaymentOption) => void;
  amount: number;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "naira",
    name: "Naira",
    icon: "N",
    iconBg: "bg-green-500",
    balance: "₦100,000.00",
    value: "100000",
    type: "fiat",
  },
  {
    id: "usdt",
    name: "USDT",
    icon: "T",
    iconBg: "bg-green-500",
    cryptoAmount: "500 USDT",
    value: "$500.00",
    type: "crypto",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: "B",
    iconBg: "bg-orange-500",
    cryptoAmount: "0.0000095 BTC",
    value: "$1,400.44",
    type: "crypto",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: "E",
    iconBg: "bg-gray-500",
    cryptoAmount: "0.00028 ETH",
    value: "$120.00",
    type: "crypto",
  },
  {
    id: "solana",
    name: "Solana",
    icon: "S",
    iconBg: "bg-gradient-to-br from-purple-500 to-blue-500",
    cryptoAmount: "17,185.79 SOL",
    value: "$5,100.00",
    type: "crypto",
  },
];

export default function PaymentMethod({
  onBack,
  onSelect,
  amount,
}: PaymentMethodProps) {
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={onBack}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Payment Method</h1>
      </header>

      <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${option.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-lg font-bold">
                  {option.icon}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-base">
                  {option.name}
                </span>
                {option.cryptoAmount && (
                  <span className="text-gray-400 text-sm">
                    {option.cryptoAmount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              {option.balance ? (
                <span className="text-white font-medium">{option.balance}</span>
              ) : (
                <span className="text-white font-medium">{option.value}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

