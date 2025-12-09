"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";

interface InfoCard {
  id: number;
  label: string;
  value: string;
  hasIcon?: boolean;
  iconType?: "copy" | "chevron";
}

const infoCards: InfoCard[] = [
  {
    id: 1,
    label: "Your Account Number",
    value: "9068233532",
    hasIcon: true,
    iconType: "copy",
  },
  {
    id: 2,
    label: "Account Tier",
    value: "Tier 2",
    hasIcon: true,
    iconType: "chevron",
  },
  {
    id: 3,
    label: "Gender",
    value: "Male",
    hasIcon: false,
  },
  {
    id: 4,
    label: "Date of Birth",
    value: "04-10-2003",
    hasIcon: false,
  },
  {
    id: 5,
    label: "Email Address",
    value: "focusinnit@gmail.com",
    hasIcon: true,
    iconType: "chevron",
  },
  {
    id: 6,
    label: "Phone Number",
    value: "09060933538",
    hasIcon: true,
    iconType: "chevron",
  },
];

export default function ProfileIdPage() {
  const router = useRouter();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-10 h-10 rounded-full bg-black flex items-center justify-center"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto">
        {/* User Profile Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Profile Picture */}
          <div className="w-24 h-24 rounded-full bg-blue-200 overflow-hidden flex-shrink-0">
            {/* Placeholder for profile picture - you can replace with actual image */}
            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
              <span className="text-blue-700 text-2xl font-bold">AD</span>
            </div>
          </div>

          {/* Name */}
          <h2 className="text-white font-bold text-xl text-center">
            Agbani Darego Durojaye
          </h2>
        </div>

        {/* Information Cards */}
        <div className="flex flex-col gap-3">
          {infoCards.map((card) => (
            <div
              key={card.id}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">{card.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white">{card.value}</span>
                {card.hasIcon && (
                  <div className="flex-shrink-0">
                    {card.iconType === "copy" ? (
                      <button
                        onClick={() => handleCopy(card.value)}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        <HiOutlineDocumentDuplicate className="w-5 h-5" />
                      </button>
                    ) : (
                      <HiChevronRight className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

