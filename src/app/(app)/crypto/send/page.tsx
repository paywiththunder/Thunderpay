"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiBolt, HiOutlineBuildingOffice2 } from "react-icons/hi2";
import Link from "next/link";

export default function SendPage() {
  const router = useRouter();

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

      <div className="flex flex-col gap-4 px-4 overflow-y-auto pb-6">
        <Link
          href="/crypto/send/thunder"
          className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <HiBolt className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white font-medium text-lg">To Thunder</span>
          </div>
          <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
        </Link>

        <Link
          href="/crypto/send/bank"
          className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <HiOutlineBuildingOffice2 className="w-6 h-6 text-white flex-shrink-0" />
            <span className="text-white font-medium text-lg">To Bank</span>
          </div>
          <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}

