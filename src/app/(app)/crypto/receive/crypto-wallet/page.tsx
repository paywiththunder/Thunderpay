"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiBolt } from "react-icons/hi2";
import Image from "next/image";
import Wallet from "../../../../../../public/cryptowallet.png";

export default function CreateCryptoWalletPage() {
  const router = useRouter();

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
        <h1 className="text-2xl md:text-3xl font-semibold text-white">From Crypto Wallet</h1>
      </header>

      {/* Main illustration */}
      <div className="flex flex-col items-center z-10 flex-1 justify-center w-full overflow-y-auto">
        <div className="w-full md:w-64 md:h-64 relative">
          <Image
            src={Wallet}
            alt="Wallet"
            width={384}
            height={519}
            className="w-full object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-semibold text-center mb-3 mt-20">
          Create Your Crypto Wallet
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-300 max-w-xs md:max-w-md text-sm md:text-base mb-6">
          Set up your crypto wallet to send, receive, and fund your fiat wallet instantly.
        </p>
      </div>

      {/* Button */}
      <div className="w-full flex flex-col items-center space-y-4 z-10 flex-shrink-0 pb-4 mb-20">
        <button
          onClick={() => router.push("/crypto/receive/crypto-wallet/add-wallet")}
          className="w-11/12 md:w-1/2 py-3 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] text-white font-medium text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

