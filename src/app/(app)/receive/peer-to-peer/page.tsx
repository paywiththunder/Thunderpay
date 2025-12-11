"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight } from "react-icons/hi2";
import { IoCopyOutline, IoClose } from "react-icons/io5";
import { FaWhatsapp, FaFacebook, FaPhone } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Avatars from "../../../../../public/friends.png";

export default function PeerToPeerRequestPage() {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://thunder.app/invite/Focus123";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const message = `Join me on Thunder! ${inviteLink}`;
    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case "phone":
        url = `sms:?body=${encodeURIComponent(message)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Peer to Peer Request</h1>
      </header>

      {/* Main illustration */}
      <div className="flex flex-col items-center z-10 flex-1 justify-center w-full overflow-y-auto">
        <div className="w-full md:w-64 md:h-64 relative">
          <Image
            src={Avatars}
            alt="Invite Friends"
            width={384}
            height={519}
            className="w-full object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-semibold text-center mb-3 mt-20">
          Invite Friends
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-300 max-w-xs md:max-w-md text-sm md:text-base mb-6">
          Start requesting and sending money by inviting your friends to Thunder.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col items-center space-y-4 z-10 flex-shrink-0 pb-4 mb-20">
        <button
          onClick={() => router.push("/receive/peer-to-peer/search")}
          className="w-11/12 md:w-1/2 py-3 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] text-white font-medium text-lg"
        >
          Search for Peer
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-11/12 md:w-1/2 py-3 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] text-white font-medium text-lg"
        >
          Invite
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] rounded-t-3xl border-t border-white/20 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Invite</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <IoClose className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Share Link */}
            <div className="bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
              <span className="text-white text-sm flex-1 truncate">{inviteLink}</span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <IoCopyOutline className="w-5 h-5 text-white" />
              </button>
              {copied && (
                <span className="text-green-400 text-xs">Copied!</span>
              )}
            </div>

            {/* Sharing Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleShare("whatsapp")}
                className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <FaWhatsapp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">WhatsApp</span>
                </div>
                <HiChevronRight className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => handleShare("facebook")}
                className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <FaFacebook className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Facebook</span>
                </div>
                <HiChevronRight className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => handleShare("twitter")}
                className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <FaXTwitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">X</span>
                </div>
                <HiChevronRight className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={() => handleShare("phone")}
                className="mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <FaPhone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Phone</span>
                </div>
                <HiChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

