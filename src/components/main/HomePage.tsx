import React from "react";
import Link from "next/link";
import {
  HiOutlineQrCode,
  HiOutlineQuestionMarkCircle,
  HiOutlineBell,
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

export default function HomePage() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600/50 overflow-hidden">
            {/* Placeholder for avatar */}
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600"></div>
          </div>
          <h1 className="font-semibold text-lg">Hi Agbani</h1>
        </div>
        <div className="flex gap-4 text-white">
          <HiOutlineQrCode className="w-6 h-6" />
          <HiOutlineQuestionMarkCircle className="w-6 h-6" />
          <HiOutlineBell className="w-6 h-6" />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 text-sm text-gray-400 text-white font-semibold">
        <button className=" border-b-2 border-[#3B82F6] pb-1">
          Cash
        </button>
        <button>Crypto</button>
        <button>International</button>
      </div>

      {/* Total Assets Card */}
      <div className="assets p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
        {/* Background swirls decorative elements */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <span>Total assets</span>
              <HiOutlineEye />
            </div>

            {/* Add Wallet Link */}
            <Link
              href="/home/add-wallet"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10"
            >
              <span className="text-lg leading-none transform translate-y-[-1px]">+</span>
              Add Wallet
            </Link>
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
          {/* Placeholder illustration for wallet */}
          <Image src={NoTransaction} className="mb-3" alt="No Transaction" width={200} height={200} />
          <p className="text-gray-500 font-[600] text-[2rem] -mt-18 mb-10">No Transaction Yet</p>
        </div>
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
      className="flex flex-col items-center justify-center gap-2 bg-app-card py-4 rounded-xl active:scale-95 transition-transform border border-white/20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
    >
      <Icon className="w-7 h-7 text-white" />
      <span className="text-xs text-gray-300">{label}</span>
    </Link>
  );
}