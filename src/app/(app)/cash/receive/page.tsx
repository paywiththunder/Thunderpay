"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiBolt } from "react-icons/hi2";
import { FaWallet, FaDollarSign, FaCreditCard, FaQrcode } from "react-icons/fa";
import { IoShareOutline, IoCopyOutline } from "react-icons/io5";
import Link from "next/link";

export default function ReceivePage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const accountNumber = "9068233532";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Thunder Account Number",
        text: `My Thunder Account Number: ${accountNumber}`,
      });
    }
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Receive</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Your Thunder Account Numbers Section */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-white text-sm font-medium">
            Your Thunder Account Numbers
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-white text-2xl font-bold">{accountNumber}</span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <IoCopyOutline className="w-5 h-5 text-white" />
            </button>
          </div>
          <button
            onClick={handleShare}
            className="w-full bg-white/20 hover:bg-white/30 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
          >
            <IoShareOutline className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Share</span>
          </button>
          {copied && (
            <p className="text-white/80 text-xs text-center">Copied to clipboard!</p>
          )}
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-white/60 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Receive Options */}
        <div className="flex flex-col gap-4">
          <Link
            href="/receive/crypto-wallet"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <FaWallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <span className="text-white font-medium text-lg">
                Crypto Wallet
              </span>
              <span className="text-gray-400 text-sm">
                Transfer funds from your Thunder crypto balance.
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-1" />
          </Link>

          <Link
            href="/receive/international-wallet"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <FaDollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <span className="text-white font-medium text-lg">
                International Wallet
              </span>
              <span className="text-gray-400 text-sm">
                Add funds from your international wallet instantly.
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-1" />
          </Link>

          <Link
            href="/receive/peer-to-peer"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <HiBolt className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <span className="text-white font-medium text-lg">
                Peer-to-Peer Request
              </span>
              <span className="text-gray-400 text-sm">
                Request money directly from friends on Thunder.
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-1" />
          </Link>

          <Link
            href="/receive/top-up"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <FaCreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <span className="text-white font-medium text-lg">
                Top-up with Card/Account
              </span>
              <span className="text-gray-400 text-sm">
                Add funds instantly using your bank card.
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-1" />
          </Link>

          <Link
            href="/receive/scan-qr"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <FaQrcode className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-grow gap-1">
              <span className="text-white font-medium text-lg">
                Scan QR Code
              </span>
              <span className="text-gray-400 text-sm">
                Add funds instantly using a Thunder QR.
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0 mt-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

