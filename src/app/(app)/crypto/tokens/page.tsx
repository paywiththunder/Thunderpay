"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiOutlineSearch } from "react-icons/hi";
import { FaBitcoin, FaEthereum, FaWallet } from "react-icons/fa";
import { SiTether, SiSolana } from "react-icons/si";
import { getCurrencies } from "@/services/wallet";

// Helper for icons
const getAssetConfig = (symbol: string) => {
    switch (symbol.toUpperCase()) {
        case "USDT":
            return { icon: <SiTether className="text-white w-4 h-4" />, bg: "bg-green-500", name: "Tether" };
        case "BTC":
            return { icon: <FaBitcoin className="text-white w-4 h-4" />, bg: "bg-orange-500", name: "Bitcoin" };
        case "ETH":
            return { icon: <FaEthereum className="text-gray-800 w-4 h-4" />, bg: "bg-gray-200", name: "Ethereum" };
        case "SOL":
            return { icon: <SiSolana className="text-white w-4 h-4" />, bg: "bg-purple-500", name: "Solana" };
        default:
            return { icon: <FaWallet className="text-white w-4 h-4" />, bg: "bg-gray-700", name: symbol };
    }
};

interface Currency {
    currencyId: number;
    code: string;
    name: string;
    isCrypto: boolean;
    symbol: string | null;
    logo: string | null;
}

export default function TokensPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await getCurrencies();
                // Check if response is array or part of data object
                const list = Array.isArray(response) ? response : response.data || [];
                setCurrencies(list);
            } catch (error) {
                console.error("Failed to fetch currencies", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    const filteredCurrencies = currencies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-white">Tokens</h1>
            </header>

            <div className="flex flex-col gap-4 px-4 overflow-y-auto">
                {/* Search Bar */}
                <div className="relative">
                    <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="search"
                        className="w-full bg-transparent border border-blue-900/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Tokens List */}
                <div className="flex flex-col gap-3 mt-2">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : filteredCurrencies.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No tokens found</div>
                    ) : (
                        filteredCurrencies.map((currency) => {
                            const config = getAssetConfig(currency.code);

                            return (
                                <Link
                                    href={`/crypto/tokens/${currency.code.toLowerCase()}`}
                                    key={currency.currencyId}
                                    className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{currency.name}</span>
                                            <span className="text-gray-500 text-xs">{currency.code}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-white font-medium">---</span>
                                        {/* <span className={`text-xs ${token.isPositive ? 'text-green-500' : 'text-red-500'}`}>{token.change}</span> */}
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
