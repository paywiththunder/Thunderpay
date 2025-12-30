"use client";
import React from "react";

interface CardData {
  id: number;
  gradient: string;
  rotation: string;
  scale: string;
  zIndex: number;
}

const cards: CardData[] = [
  {
    id: 1,
    gradient: "from-orange-400 to-yellow-500",
    rotation: "-rotate-8",
    scale: "scale-90",
    zIndex: 1,
  },
  {
    id: 2,
    gradient: "from-blue-500 to-purple-600",
    rotation: "-rotate-2",
    scale: "scale-90",
    zIndex: 10,
  },
  {
    id: 3,
    gradient: "from-green-400 to-green-600",
    rotation: "rotate-8",
    scale: "scale-90",
    zIndex: 1,
  },
];

import { HiCreditCard } from "react-icons/hi2";

export default function CardsPage() {
  const isComingSoon = true;

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-semibold text-white">Cards</h1>
      </header>

      <div className="relative flex-1 flex flex-col">
        {/* Content with optional blur */}
        <div className={`flex flex-col flex-1 transition-all duration-500 ${isComingSoon ? "blur-[2px] pointer-events-none opacity-60" : ""}`}>
          {/* Card Carousel */}
          <div className="relative flex items-center justify-center py-8 px-4 mb-8">
            <div className="flex gap-12 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory w-full">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`min-w-[280px] h-[400px] rounded-2xl bg-gradient-to-br ${card.gradient} p-6 flex flex-col justify-between relative snap-center ${card.rotation} ${card.scale} transition-all flex-shrink-0`}
                  style={{ zIndex: card.zIndex }}
                >
                  {/* Card Chip/NFC Symbol - only on center card */}
                  {card.id === 2 && (
                    <div className="absolute top-4 right-4 w-12 h-10 bg-white/40 rounded-lg backdrop-blur-sm"></div>
                  )}

                  {/* Card Number Block - only on center card */}
                  {card.id === 2 && (
                    <div className="absolute bottom-8 left-6 w-32 h-8 bg-white/40 rounded-lg backdrop-blur-sm"></div>
                  )}

                  {/* Card Content */}
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="flex flex-col items-center text-center px-6 gap-3 mb-8">
            <h2 className="text-2xl font-bold text-white">Get your Thunder Card</h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Spend anywhere, online or offline, powered by your Thunder wallet.
            </p>
          </div>

          {/* Create Card Button */}
          <div className="px-6 pb-6 mt-auto">
            <button className="w-full rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] text-white font-semibold py-4 active:scale-95 transition-transform">
              Create a card
            </button>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/10">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                <HiCreditCard className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Virtual Cards Coming Soon</h3>
              <p className="text-gray-400 text-sm max-w-[250px]">
                We're currently building a secure card system for your global payments. Stay tuned!
              </p>
              <div className="mt-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="text-xs font-medium text-purple-400 uppercase tracking-widest">In Development</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}