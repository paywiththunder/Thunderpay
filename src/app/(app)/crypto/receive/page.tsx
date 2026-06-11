"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { FaBitcoin, FaEthereum, FaWallet } from "react-icons/fa";
import { SiTether, SiSolana } from "react-icons/si";
import Link from "next/link";
import { getWallets } from "@/services/wallet";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  fiatValue: string;
  icon: React.ElementType;
  color: string;
}

const getAssetConfig = (symbol: string) => {
  switch (symbol.toUpperCase()) {
    case "USDT":
      return { icon: SiTether, color: "text-green-500", name: "Tether" };
    case "BTC":
      return { icon: FaBitcoin, color: "text-orange-500", name: "Bitcoin" };
    case "ETH":
      return { icon: FaEthereum, color: "text-purple-400", name: "Ethereum" };
    case "SOL":
      return { icon: SiSolana, color: "text-cyan-400", name: "Solana" };
    default:
      return { icon: FaWallet, color: "text-gray-400", name: symbol };
  }
};

import { useQuery } from "@tanstack/react-query";

export default function ReceivePage() {
  const router = useRouter();

  const { data: walletsResponse, isLoading: loading } = useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
    staleTime: 1000 * 60 * 5,
  });

  const assets = React.useMemo(() => {
    if (!walletsResponse) return [];
    const walletList = Array.isArray(walletsResponse) ? walletsResponse : walletsResponse.data || [];

    return walletList.map((wallet: any) => {
      const currency = wallet.currency;
      const symbol = currency?.code || currency?.ticker || "UNKNOWN";
      const config = getAssetConfig(symbol);
      const rawBalance = wallet.availableBalance ?? wallet.totalBalance ?? 0;
      const balance = Number(rawBalance).toLocaleString('en-US', { maximumFractionDigits: 8 });

      return {
        id: wallet.walletId?.toString() || Math.random().toString(),
        symbol: symbol,
        name: currency?.name || config.name,
        balance: `${balance} ${symbol}`,
        fiatValue: "---",
        icon: config.icon,
        color: config.color,
      };
    });
  }, [walletsResponse]);



  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6 mb-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white">Receive</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <p className="text-gray-500">No wallets found</p>
            <Link
              href="/crypto/receive/crypto-wallet"
              className="px-6 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              Add Wallet
            </Link>
          </div>
        ) : (
          assets.map((asset: CryptoAsset) => (
            <div
              key={asset.id}
              className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between border border-white/5"
            >
              <Link
                href={`/crypto/receive/${asset.symbol.toLowerCase()}`}
                className="flex items-center gap-4 flex-grow"
              >
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border border-white/5">
                  <asset.icon className={`w-6 h-6 ${asset.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg">{asset.name}</span>
                  <span className="text-gray-400 text-sm">{asset.balance}</span>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

