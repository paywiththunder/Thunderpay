"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";

export default function SendPage() {
  const router = useRouter();

  const sendOptions = [
    {
      id: "cash",
      name: "Cash",
      description: "Transfer to Bank",
      icon: "₦",
      iconBg: "bg-gradient-to-br from-green-400 to-green-600",
      route: "/crypto/send/cash",
    },
    // {
    //   id: "bank",
    //   name: "Bank",
    //   description: "Send to bank account",
    //   icon: "B",
    //   iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    //   route: "/crypto/send/bank",
    // },
    // {
    //   id: "thunder",
    //   name: "Thunder",
    //   description: "Send to Thunder account",
    //   icon: "⚡",
    //   iconBg: "bg-gradient-to-br from-yellow-400 to-orange-600",
    //   route: "/crypto/send/thunder",
    // },
    // {
    //   id: "wallet",
    //   name: "Wallet",
    //   description: "Send to external wallet",
    //   icon: "W",
    //   iconBg: "bg-gradient-to-br from-purple-400 to-purple-600",
    //   route: "/crypto/send/wallet",
    // },
  ];

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

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        <p className="text-gray-400 text-sm">Choose where to send your crypto</p>

        <div className="flex flex-col gap-3">
          {sendOptions.map((option) => (
            <Link
              key={option.id}
              href={option.route}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-transform hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${option.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xl font-bold">
                    {option.icon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg">{option.name}</span>
                  <span className="text-gray-400 text-sm">{option.description}</span>
                </div>
              </div>
              <HiChevronRight className="w-6 h-6 text-white flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
