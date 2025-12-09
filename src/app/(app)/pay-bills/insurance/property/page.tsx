"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

export default function PropertyInsurancePage() {
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
        <h1 className="text-2xl font-bold text-white">Property & Home Insurance</h1>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <p className="text-gray-400 text-center">Property & Home Insurance payment</p>
      </div>
    </div>
  );
}

