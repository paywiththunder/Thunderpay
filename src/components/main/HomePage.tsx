'use client'
import React from "react";
import Link from "next/link";
import {
  HiOutlineEye,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import {
  GiReceiveMoney,
  GiPayMoney,
  GiBanknote,
  GiWallet,
} from "react-icons/gi";
import Wlcomemessages from "./Wlcomemessages";
import Image from "next/image";
import NoTransaction from "../../../public/walletimg.png";
import AppHeader from "./AppHeader";

export default function HomePage() {
  const isComingSoon = true; // Simple toggle for later use

  return (
    <div className="flex flex-col gap-3 w-full">
      <AppHeader />

      <div className="relative">
        {/* Content with optional blur */}
        <div className={`flex flex-col gap-3 transition-all duration-500 ${isComingSoon ? "blur-[2px] pointer-events-none opacity-60" : ""}`}>
          {/* Total Assets Card */}
          <div className="assets p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
            {/* Background swirls decorative elements */}
            <div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <span>Total assets</span>
                <HiOutlineEye />
              </div>
              <h2 className="text-3xl font-bold mt-1">₦0.00</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full">
              <span>Account Number: 9068233532</span>
              <HiOutlineDocumentDuplicate className="cursor-pointer" />
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-4 gap-4">
            <ActionButton icon={GiPayMoney} label="Pay Bills" href="/pay-bills" />
            <ActionButton icon={GiBanknote} label="Send" href="/send" />
            <ActionButton icon={GiReceiveMoney} label="Receive" href="/receive" />
            <ActionButton icon={GiWallet} label="Convert" href="/convert" />
          </div>

          <Wlcomemessages />

          {/* Recent Transactions */}
          <div>
            <h3 className="font-semibold mb-4">Recent transactions</h3>
            <div className="flex flex-col items-center justify-center">
              <Image src={NoTransaction} className="mb-3" alt="No Transaction" width={200} height={200} />
              <p className="text-gray-500 font-[600] text-[2rem] -mt-18 mb-16">No Transaction Yet</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                <GiWallet className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Fiat Wallet Coming Soon</h3>
              <p className="text-gray-400 text-sm max-w-[250px]">
                We're currently perfecting the fiat banking experience. Check back soon for transfers and bill payments!
              </p>
              <div className="mt-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Under Construction</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for grid buttons
function ActionButton({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 bg-app-card py-4 rounded-xl active:scale-95 transition-transform border border-white/20 bg-linear-to-b from-[#161616] to-[#121212] shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
    >
      <Icon className="w-7 h-7 text-white" />
      <span className="text-xs text-gray-300">{label}</span>
    </Link>
  );
}