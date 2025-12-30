"use client";
import React from "react";
import Image from "next/image";
import SpinIcon from "../../../../public/spin.png";
import CashbacksIcon from "../../../../public/cashbacks.png";
import FAQIcon from "../../../../public/faq.png";
import ReferIcon from "../../../../public/refer.png";

interface RewardCard {
  id: number;
  title: string;
  description: string;
  icon: any;
  bgColor: string;
  bgPattern?: string;
}

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
  },
  {
    id: 4,
    title: "FAQS",
    description: "",
    icon: FAQIcon,
    bgColor: "bg-blue-600",
  },
];

import { HiGift } from "react-icons/hi2";

export default function RewardsPage() {
  const isComingSoon = true;

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
      </header>

      <div className="relative flex-1 flex flex-col">
        {/* Content with optional blur */}
        <div className={`flex flex-col flex-1 gap-4 px-4 transition-all duration-500 ${isComingSoon ? "blur-[2px] pointer-events-none opacity-60" : ""}`}>
          {/* Thunder Rewards Banner */}
          <div className="assets rounded-2xl p-5 flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white mb-1">Thunder Rewards</h2>
              <p className="text-blue-100 text-xs">Number of thunder bonus</p>
            </div>
            <div className="text-2xl font-bold text-white">₦0</div>
          </div>

          {/* Refer and Earn Banner */}
          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-5 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-2">Refer and Earn</h2>
              <p className="text-white/90 text-xs mb-4 leading-relaxed">
                Share Thunder and get rewarded when your friends join.
              </p>
              <button className="border-2 border-[#FFFFFF] text-white font-semibold px-5 py-2 rounded-full text-xs hover:bg-pink-500/20 transition-colors">
                Refer now
              </button>
            </div>
            {/* Decorative coins and gift box illustration - using background pattern */}
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-20">
              <div className="relative w-full h-full">
                {/* Simplified decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-12 right-8 w-6 h-6 bg-yellow-400 rounded-full"></div>
                <div className="absolute bottom-8 right-6 w-10 h-10 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Rewards Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {rewardCards.map((card) => (
              <div
                key={card.id}
                className={`rounded-2xl flex flex-col p-4 min-h-[160px] relative overflow-hidden`}
              >
                {/* Image Container */}
                <div className="flex justify-center items-center mb-3 flex-shrink-0 w-full">
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={70}
                    height={70}
                    className="object-contain w-full"
                  />
                </div>

                {/* Text Content */}
                <div className="relative z-10 flex flex-col">
                  <h3 className="text-white font-bold text-base mb-1">{card.title}</h3>
                  {card.description && (
                    <p className="text-white/90 text-xs leading-tight">{card.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Overlay */}
        {isComingSoon && (
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