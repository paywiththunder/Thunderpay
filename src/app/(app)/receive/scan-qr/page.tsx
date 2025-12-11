"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Image from "next/image";
import QRCode from "../../../../../public/qrcode.png";

export default function ScanQRPage() {
  const router = useRouter();
  const recipientName = "Agbani Darego Durojaye";

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-between py-10 px-6 relative overflow-x-hidden md:py-16 md:px-8">
      {/* Header */}
      <header className="relative flex items-center justify-center w-full z-10 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="absolute left-0 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Scan QR Code</h1>
      </header>

      {/* Main content */}
      <div className="flex flex-col items-center z-10 flex-1 justify-center w-full overflow-y-auto">
        {/* QR Code */}
        <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-3xl p-8 mb-6">
          <Image
            src={QRCode}
            alt="QR Code"
            width={300}
            height={300}
            className="w-full max-w-[300px] h-auto"
          />
        </div>

        {/* Recipient Name */}
        <h2 className="text-xl md:text-2xl font-semibold text-white text-center mb-4">
          {recipientName}
        </h2>

        {/* Instructions */}
        <p className="text-center text-gray-300 max-w-xs md:max-w-md text-sm md:text-base">
          Scan this QR to deposit funds instantly.
        </p>
      </div>
    </div>
  );
}

