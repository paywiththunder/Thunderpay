"use client";
import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { HiOutlineRefresh } from "react-icons/hi";
import { getCurrencies } from "@/services/wallet";
import { getAssetConfig } from "@/utils/cryptoUtils";

interface Currency {
    currencyId: number;
    code: string;
    name: string;
    isCrypto: boolean;
    symbol: string | null;
    logo: string | null;
}

export default function TokenDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const router = useRouter();

    // Unwrap the params using React.use()
    const resolvedParams = use(params);
    const { symbol } = resolvedParams;

    const [currency, setCurrency] = useState<Currency | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const response = await getCurrencies();
                const list = Array.isArray(response) ? response : response.data || [];
                const found = list.find((c: Currency) => c.code.toLowerCase() === symbol.toLowerCase());
                setCurrency(found || null);
            } catch (error) {
                console.error("Failed to fetch currencies", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrency();
    }, [symbol]);

    if (loading) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!currency) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
                <header className="relative flex items-center justify-center px-4 py-6">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                    >
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Token Not Found</h1>
                </header>
                <div className="flex flex-1 items-center justify-center text-gray-500">
                    Token "{symbol}" not found.
                </div>
            </div>
        );
    }

    const config = getAssetConfig(currency.code);

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
                <h1 className="text-xl font-bold text-white">{currency.code} - {currency.name}</h1>
            </header>

            <div className="flex flex-col items-center px-4 mt-8 flex-1">
                {/* Main Icon */}
                <div className="mb-6">
                    <div className={`w-24 h-24 rounded-full ${config.bg} flex items-center justify-center overflow-hidden`}>
                        {currency.logo ? (
                            <img
                                src={currency.logo}
                                alt={currency.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <config.Icon className={`w-14 h-14 ${config.color}`} />
                        )}
                    </div>
                </div>

                {/* Balance */}
                <h2 className="text-4xl font-bold text-white mb-2">0.00 {currency.code}</h2>
                <span className="text-red-500 font-medium mb-12">+$0.00 +0.00%</span>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full justify-center mb-12">
                    <ActionButton icon={GiPayMoney} label="Send" href="/crypto/send" />
                    <ActionButton icon={GiReceiveMoney} label="Receive" href="/crypto/receive" />
                    <ActionButton icon={HiOutlineRefresh} label="Convert" href="/crypto/convert" />
                </div>

                {/* Price Card */}
                <div className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-xl p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {currency.logo ? (
                            <img
                                src={currency.logo}
                                alt={currency.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <config.Icon className={`w-7 h-7 ${config.color}`} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-xl font-bold">$0.00</span>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-500">+$0.00 +0.00%</span>
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
