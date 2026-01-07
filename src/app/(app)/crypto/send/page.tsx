"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiMagnifyingGlass, HiChevronRight } from "react-icons/hi2";
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
  change: string;
  changePercent: string;
  icon: React.ElementType;
  color: string;
  isNegative: boolean;
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

export default function SendPage() {
  const router = useRouter();
  /*
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        const walletList = Array.isArray(response) ? response : response.data || [];

        const mappedAssets: CryptoAsset[] = walletList.map((wallet: any) => {
          const currency = wallet.currency;
          const symbol = currency?.code || currency?.ticker || "UNKNOWN";
          const config = getAssetConfig(symbol);
          const rawBalance = wallet.availableBalance ?? wallet.totalBalance ?? 0;
          const balance = Number(rawBalance).toLocaleString('en-US', { maximumFractionDigits: 8 });

          // Mocking change data as it's not in the wallet API
          const mockChange = (Math.random() * 20 - 10).toFixed(2);
          const mockPercent = (Math.random() * 5 - 2.5).toFixed(2);
          const isNegative = parseFloat(mockChange) < 0;

          return {
            id: wallet.walletId?.toString() || Math.random().toString(),
            symbol: symbol,
            name: currency?.name || config.name,
            balance: `${balance} ${symbol}`,
            fiatValue: `$${(rawBalance * 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Placeholder fiat conversion
            change: `${isNegative ? "-" : "+"}$${Math.abs(parseFloat(mockChange)).toFixed(2)}`,
            changePercent: `${isNegative ? "-" : "+"}${Math.abs(parseFloat(mockPercent)).toFixed(2)}%`,
            icon: config.icon,
            color: config.color,
            isNegative,
          };
        });

        setAssets(mappedAssets);
      } catch (error) {
        console.error("Failed to fetch wallets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Send</h1>
      </header>

      <div className="flex flex-col gap-6 px-4">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-all font-medium"
          />
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No assets found</div>
          ) : (
            filteredAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/crypto/send/${asset.symbol.toLowerCase()}`}
                className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between border border-white/5 active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <asset.icon className={`w-6 h-6 ${asset.color}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">{asset.symbol}</span>
                    <span className="text-gray-400 text-sm">{asset.balance}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-white font-bold text-lg">{asset.fiatValue}</span>
                  <div className={`flex gap-2 text-xs font-medium ${asset.isNegative ? "text-red-500" : "text-green-500"}`}>
                    <span>{asset.change}</span>
                    <span>{asset.changePercent}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
  */

  return (
    <div className="flex flex-col w-full flex-1 bg-black mt-24 min-h-full py-6 items-center justify-center">
      <header className="absolute top-0 w-full flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Send</h1>
      </header>
      <div className="text-gray-400 text-center px-4">
        <p className="text-lg mb-2">Feature Unavailable</p>
        <p className="text-sm">We are currently experiencing issues with the Send functionality. Please try again later.</p>
      </div>
    </div>
  );
}


