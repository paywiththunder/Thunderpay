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

export default function CardsPage() {
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-semibold text-white">Cards</h1>
      </header>

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
  );
}