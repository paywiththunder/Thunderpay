"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft, MdCurrencyExchange } from "react-icons/md";

const ConvertPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col w-full flex-1 py-6">
            <header className="relative flex items-center justify-center px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-white">Convert</h1>
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                <div className="p-8 rounded-3xl bg-[#161616]/50 border border-white/10 flex flex-col items-center max-w-sm w-full">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        <MdCurrencyExchange className="w-8 h-8 text-white/50" />
                    </div>
                    <div className="text-white text-lg font-semibold mb-2">Feature unavailable...</div>
                    <p className="text-gray-400 text-sm">
                        This feature is currently under development. Please check back later.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConvertPage;
