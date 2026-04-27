"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight } from "react-icons/hi2";

interface CryptoBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iconBg: string;
  balance: string;
  value: string;
}

const cryptoBalances: CryptoBalance[] = [
  {
    id: "usdt",
    name: "USDT",
    symbol: "USDT",
    icon: "T",
    iconBg: "bg-green-500",
    balance: "500 USDT",
    value: "$500.00",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "B",
    iconBg: "bg-orange-500",
    balance: "0.0000095 BTC",
    value: "$1,400.44",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "E",
    iconBg: "bg-purple-500",
    balance: "0.00028 ETH",
    value: "$120.00",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    icon: "S",
    iconBg: "bg-gradient-to-br from-purple-500 to-blue-500",
    balance: "17,185.79 SOL",
    value: "$5,100.00",
  },
];

export default function SelectCryptoBalancePage() {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoBalance | null>(null);

  const handleSelect = (crypto: CryptoBalance) => {
    setSelectedCrypto(crypto);
    router.push(`/receive/crypto-wallet/amount?crypto=${crypto.id}`);
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

      <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
        {cryptoBalances.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => handleSelect(crypto)}
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${crypto.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-lg font-bold">
                  {crypto.icon}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-base">
                  {crypto.name}
                </span>
                <span className="text-gray-400 text-sm">
                  {crypto.balance}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-medium">{crypto.value}</span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}

