"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import SpinIcon from "../../../../public/spin.png";
import CashbacksIcon from "../../../../public/cashbacks.png";
import FAQIcon from "../../../../public/faq.png";
import ReferIcon from "../../../../public/refer.png";
import { HiGift, HiArrowPath, HiMiniBolt } from "react-icons/hi2";
import { getCashbackBalance, convertBolts, CashbackBalanceData } from "@/services/cashback";
import { getWallets } from "@/services/wallet";
import BoltsHistory from "@/components/rewards/BoltsHistory";
import { toast } from "react-hot-toast";

interface RewardCard {
  id: number;
  title: string;
  description: string;
  icon: any;
  bgColor: string;
  bgPattern?: string;
  onClick?: () => void;
}

export default function RewardsPage() {
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<CashbackBalanceData | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await getCashbackBalance(3); // Using currencyId=3 as per your example
      if (response.success) {
        setBalance(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch balance:", err);
      setError(err?.description || "Failed to load rewards balance");
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!balance || !balance.canConvert || balance.availableBolts < balance.minimumRequired) {
      toast.error(`Minimum of ${balance?.minimumRequired || 0} bolts required to convert.`);
      return;
    }

    try {
      setIsConverting(true);

      // Fetch user's wallets to find the FIAT/NGN wallet to credit
      const walletsResponse = await getWallets();

      if (!walletsResponse.success || !walletsResponse.data) {
        throw new Error("Failed to fetch wallets");
      }

      // Look for a FIAT wallet, or default to the first available wallet
      const targetWallet = walletsResponse.data.find(
        (w: any) => w.walletType === "FIAT" || w.currency?.ticker === "NGN"
      ) || walletsResponse.data[0];

      if (!targetWallet || !targetWallet.walletId) {
        throw new Error("No suitable wallet found to credit conversion.");
      }

      // Send the payload: { walletId, boltsToConvert }
      const response = await convertBolts({
        walletId: targetWallet.walletId,
        boltsToConvert: balance.availableBolts
      });

      if (response.success && response.data) {
        toast.success(`Successfully converted ${response.data.boltsConverted} bolts to ${response.data.amountCredited} ${response.data.currency}`);
        fetchBalance(); // Refresh the bolts balance
      }
    } catch (err: any) {
      toast.error(err?.description || err?.message || "Conversion failed. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const rewardCards: RewardCard[] = [
    {
      id: 1,
      title: "Spin to Win",
      description: "Spin to win instant rewards",
      icon: SpinIcon,
      bgColor: "bg-gradient-to-br from-red-500 to-orange-500",
      bgPattern: "radial",
    },
    {
      id: 2,
      title: "Refer and Earn",
      description: "Invite friends and earn rewards!",
      icon: ReferIcon,
      bgColor: "bg-blue-600",
    },
    {
      id: 3,
      title: "Cashbacks",
      description: "Get instant rewards every time you spend.",
      icon: CashbacksIcon,
      bgColor: "bg-gradient-to-br from-red-500 to-orange-500",
      bgPattern: "radial",
      onClick: () => { /* Open cashback history or info */ }
    },
    {
      id: 4,
      title: "FAQS",
      description: "",
      icon: FAQIcon,
      bgColor: "bg-blue-600",
    },
  ];

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
      </header>

      <div className="relative flex-1 flex flex-col">
        {/* Content */}
        <div className={`flex flex-col flex-1 gap-4 px-4 transition-all duration-500 ${isComingSoon ? "blur-[2px] pointer-events-none opacity-60" : ""}`}>

          {/* Thunder Rewards Banner */}
          <div className="assets rounded-2xl p-5 flex justify-between items-center relative overflow-hidden group">
            <div className="flex flex-col z-10">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                Thunder Bolts <HiMiniBolt className="text-yellow-400" />
              </h2>
              <p className="text-blue-100 text-xs">
                {loading ? "Loading balance..." : `Available for conversion: ${balance?.availableBolts || 0} Bolts`}
              </p>
            </div>
            <div className="flex flex-col items-end z-10">
              <div className="text-2xl font-bold text-white mb-2">
                {loading ? "..." : `${balance?.availableBolts || 0}`}
              </div>
              {balance && balance.availableBolts > 0 && (
                <button
                  onClick={handleConvert}
                  disabled={isConverting || !balance.canConvert}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg
                    ${balance.canConvert
                      ? "bg-white text-blue-600 hover:scale-105 active:scale-95"
                      : "bg-white/20 text-white/50 cursor-not-allowed"}`}
                >
                  {isConverting ? <HiArrowPath className="animate-spin w-3.5 h-3.5" /> : <HiArrowPath className="w-3.5 h-3.5" />}
                  Convert to Cash
                </button>
              )}
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
          </div>

          {/* Stats Bar */}
          {!loading && balance && (
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-white font-bold">{balance.totalEarned} Bolts</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Redeemed</p>
                <p className="text-white font-bold">{balance.redeemed} Bolts</p>
              </div>
            </div>
          )}

          {/* Refer and Earn Banner */}
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-2">Refer and Earn</h2>
              <p className="text-white/90 text-xs mb-4 leading-relaxed max-w-[200px]">
                Share Thunder and get rewarded when your friends join.
              </p>
              <button className="bg-white text-orange-500 font-bold px-6 py-2 rounded-full text-xs hover:bg-orange-50 transition-colors shadow-lg">
                Refer now
              </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-30 pointer-events-none">
              <div className="relative w-full h-full">
                <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full blur-xl animate-pulse"></div>
                <HiGift className="absolute bottom-4 right-6 w-16 h-16 text-white rotate-12" />
              </div>
            </div>
          </div>

          {/* Rewards Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {rewardCards.map((card) => (
              <div
                key={card.id}
                onClick={card.onClick}
                className={`rounded-2xl flex flex-col p-4 min-h-[160px] relative overflow-hidden border border-white/10 bg-linear-to-b from-[#161616] to-[#0A0A0A] group cursor-pointer active:scale-[0.98] transition-all`}
              >
                {/* Image Container */}
                <div className="flex justify-center items-center mb-3 flex-shrink-0 w-full transform group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={70}
                    height={70}
                    className="object-contain"
                  />
                </div>

                {/* Text Content */}
                <div className="relative z-10 flex flex-col mt-auto">
                  <h3 className="text-white font-bold text-base mb-1">{card.title}</h3>
                  {card.description && (
                    <p className="text-gray-400 text-[10px] leading-tight group-hover:text-white/80 transition-colors">{card.description}</p>
                  )}
                </div>

                {/* Card Hover Effect */}
              </div>
            ))}
          </div>

          {/* Bolts Transaction History */}
          <BoltsHistory />
        </div>

        {/* Coming Soon Overlay - only shown if explicitely set or data fails critically */}
        {isComingSoon && !balance && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/10">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30">
                <HiGift className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Rewards Coming Soon</h3>
              <p className="text-gray-400 text-sm max-w-[250px]">
                Earn points and unlock exclusive rewards while using Thunder. Launching soon!
              </p>
              <div className="mt-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="text-xs font-medium text-yellow-500 uppercase tracking-widest">Stay Tuned</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}