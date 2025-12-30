"use client";
import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { HiOutlineRefresh } from "react-icons/hi";

// Mock data lookup
const tokens: Record<string, any> = {
    usdt: {
        name: "Tether",
        symbol: "USDT",
        headerTitle: "USDT - Tether",
        balance: "0.00 USDT",
        change: "+$0.00 +0.00",
        isPositive: true,
        price: "$1.00",
        priceChange: "+$0.00 +0.00%",
        icon: <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"><SiTether className="text-white w-14 h-14" /></div>,
        iconColor: "text-green-500",
    },
    btc: {
        name: "Bitcoin",
        symbol: "BTC",
        headerTitle: "BTC - Bitcoin",
        balance: "0.00 BTC",
        change: "+$0.00 +0.00",
        isPositive: false,
        price: "$100,590.20",
        priceChange: "-$1500.18 -0.12%",
        icon: <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center"><FaBitcoin className="text-white w-14 h-14" /></div>,
        iconColor: "text-orange-500",
    },
    eth: {
        name: "Ethereum",
        symbol: "ETH",
        headerTitle: "ETH - Ethereum",
        balance: "0.00 ETH",
        change: "+$0.00 +0.00",
        isPositive: true,
        price: "$3,314.36",
        priceChange: "+$0.00 +0.00%",
        icon: <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center"><FaEthereum className="text-gray-800 w-14 h-14" /></div>,
        iconColor: "text-white",
    },
};

export default function TokenDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const router = useRouter();

    // Unwrap the params using React.use()
    const resolvedParams = use(params);
    const symbol = resolvedParams.symbol;

    const token = tokens[symbol] || tokens["btc"]; // Fallback to BTC if undefined

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
            {/* Header */}
            <header className="relative flex items-center justify-center px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">{token.headerTitle}</h1>
            </header>

            <div className="flex flex-col items-center px-4 mt-8 flex-1">
                {/* Main Icon */}
                <div className="mb-6">
                    {token.icon}
                </div>

                {/* Balance */}
                <h2 className="text-4xl font-bold text-white mb-2">{token.balance}</h2>
                <span className="text-red-500 font-medium mb-12">{token.change}</span>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full justify-center mb-12">
                    <ActionButton icon={GiPayMoney} label="Send" href="/crypto/send" />
                    <ActionButton icon={GiReceiveMoney} label="Receive" href="/crypto/receive" />
                    <ActionButton icon={HiOutlineRefresh} label="Convert" href="/convert" />
                </div>

                {/* Price Card */}
                <div className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <FaBitcoin className="text-white w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-xl font-bold">{token.price}</span>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-500">{token.priceChange}</span>
                            <span className="text-gray-400">• 1 Day</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function ActionButton({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 w-24">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-white/5 transition-colors">
                <Icon className="text-white w-6 h-6" />
            </div>
            <span className="text-white text-xs">{label}</span>
        </Link>
    )
}
