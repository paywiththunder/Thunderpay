"use client";
import { useState } from "react";

interface BannerData {
  id: number;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  bgColor: "blue" | "dark";
  showClose?: boolean;
}

const banners: BannerData[] = [
  {
    id: 1,
    title: "Welcome to Thunder",
    description: "Make your first deposit to start transacting instantly.",
    buttonText: "Continue",
    buttonHref: "/deposit",
    bgColor: "blue",
    showClose: true,
  },
  {
    id: 2,
    title: "Set up your account",
    description: "Buy, send, and receive easily.",
    bgColor: "dark",
    showClose: false,
  },
];

export default function Wlcomemessages() {
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([]);

  const handleDismiss = (id: number) => {
    setDismissedBanners((prev) => [...prev, id]);
  };

  const visibleBanners = banners.filter(
    (banner) => !dismissedBanners.includes(banner.id)
  );

  if (visibleBanners.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth overscroll-x-contain snap-x snap-mandatory">
        {visibleBanners.map((banner) => (
          <div
            key={banner.id}
            className={`min-w-[280px] flex-shrink-0 p-4 rounded-xl relative overflow-hidden snap-start ${
              banner.bgColor === "blue"
                ? "bg-gradient-to-br from-blue-600 to-blue-700"
                : "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
            }`}
          >
            <div className="z-10 pr-8">
              <h3 className="font-semibold mb-1 text-white">{banner.title}</h3>
              <p
                className={`text-xs mb-3 leading-tight ${
                  banner.bgColor === "blue"
                    ? "text-blue-100"
                    : "text-gray-400"
                }`}
              >
                {banner.description}
              </p>
              {banner.buttonText && (
                <button className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors">
                  {banner.buttonText}
                </button>
              )}
            </div>
            {/* Close icon X */}
            {banner.showClose && (
              <button
                onClick={() => handleDismiss(banner.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black text-xs font-bold hover:bg-yellow-500 transition-colors z-20"
                aria-label="Close banner"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}