"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    HiOutlineEye,
    HiOutlineArrowUpRight,
    HiOutlineArrowDownLeft,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineCreditCard,
    HiOutlineInbox,
} from "react-icons/hi2";
import { getRecentTransactions } from "@/services/user";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
    GiReceiveMoney,
    GiPayMoney,
    GiBanknote,
} from "react-icons/gi";
import { MdCurrencyExchange, MdAdd } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import NoTransaction from "../../../public/walletimg.png";
import WalletForm from "../payment/WalletForm";
import { FaBitcoin, FaEthereum, FaWallet } from "react-icons/fa";
import { SiTether, SiSolana } from "react-icons/si";
import AppHeader from "./AppHeader";
import Right from '../../../public/right.png'
import Left from '../../../public/left.png'
import { getWallets, getWalletsUsd } from "@/services/wallet";

// Helper to match icons (reused logic from ReceivePage)
const getAssetConfig = (symbol: string) => {
    switch (symbol.toUpperCase()) {
        case "USDT":
            return { icon: <SiTether className="text-white w-5 h-5" />, bg: "bg-green-500", name: "Tether" };
        case "BTC":
            return { icon: <FaBitcoin className="text-white w-5 h-5" />, bg: "bg-orange-500", name: "Bitcoin" };
        case "ETH":
            return { icon: <FaEthereum className="text-gray-800 w-5 h-5" />, bg: "bg-gray-200", name: "Ethereum" };
        case "SOL":
            return { icon: <SiSolana className="text-white w-5 h-5" />, bg: "bg-purple-500", name: "Solana" };
        default:
            return { icon: <FaWallet className="text-white w-5 h-5" />, bg: "bg-gray-700", name: symbol };
    }
};

// Transaction Interface
interface Transaction {
    id: number;
    source: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    walletId: number;
    fromAddress: string | null;
    toAddress: string | null;
    createdAt: string;
}

export default function CryptoPage() {
    const router = useRouter();
    const [wallets, setWallets] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalAssets, setTotalAssets] = useState(0);
    const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

    const fetchWallets = async () => {
        try {
            const [walletsResponse, transactionsResponse] = await Promise.all([
                getWalletsUsd(),
                getRecentTransactions()
            ]);

            // Handle Wallets
            // New structure: { data: { totalAssetsUsd: number, wallets: [] } }
            if (walletsResponse?.success && walletsResponse?.data) {
                setWallets(walletsResponse.data.wallets || []);
                setTotalAssets(walletsResponse.data.totalAssetsUsd || 0);
            } else {
                // Fallback or error handling if needed
                console.warn("Unexpected wallet response format", walletsResponse);
                setWallets([]);
                setTotalAssets(0);
            }

            // Handle Transactions
            if (transactionsResponse.success) {
                setTransactions(transactionsResponse.data.items);
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const getIcon = (source: string) => {
        switch (source.toLowerCase()) {
            case "send":
            case "withdrawal":
                return HiOutlineArrowUpRight;
            case "receive":
            case "deposit":
                return HiOutlineArrowDownLeft;
            case "swap":
            case "convert":
                return HiOutlineArrowPath;
            case "bill":
            case "electricity":
                return HiOutlineLightBulb;
            case "card":
                return HiOutlineCreditCard;
            default:
                return HiOutlineInbox;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
            case "success":
                return "text-green-500";
            case "pending":
            case "processing":
                return "text-yellow-500";
            case "failed":
            case "cancelled":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

    return (
        <div className="flex flex-col gap-5 w-full pb-20">
            <AppHeader />

            {/* Total Assets Card */}
            <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                    <span>Total assets</span>
                    <HiOutlineEye className="text-gray-400" />
                </div>
                <h2 className="text-4xl font-bold mb-1">
                    {totalAssets.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </h2>
                <div className="flex items-center gap-2 text-sm">
                    {/* Change placeholder - unavailable in API currently */}
                    <span className="text-green-500 font-medium">+$0.00 +0.00</span>
                </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-4 gap-3">
                <ActionButton icon={GiPayMoney} label="Pay Bills" href="/crypto/pay-bills" />
                <ActionButton icon={GiBanknote} label="Send" href="/crypto/send" />
                <ActionButton icon={GiReceiveMoney} label="Receive" href="/crypto/receive" />
                <ActionButton icon={MdCurrencyExchange} label="Convert" href="/convert" />
            </div>

            {/* Banner */}
            <div className="w-full h-24 rounded-xl overflow-hidden relative bg-gradient-to-r from-blue-500 to-purple-600 flex items-center px-4">
                <Image src={Right} width={170} height={170} alt="Banner Pattern" className="absolute top-0 left-0 object-cover" />
                {/* Decorative elements - simple simulated banner */}
                <div className="flex-1 z-10">
                    <p className="font-bold text-lg leading-tight">Pay Smarter. Pay in Crypto.</p>
                    <p className="text-xs text-blue-100">No Banks. No Hassle. Just Crypto.</p>
                </div>
                <Image src={Left} width={170} height={170} alt="Banner Pattern" className="absolute top-0 right-0 object-cover" />
            </div>

            {/* Tokens Section */}
            <div className="rounded-2xl border border-white/10 bg-[#161616]/50 overflow-hidden">
                <div className="flex border-b border-white/10 items-center pr-2">
                    <button className="flex-1 py-3 text-sm text-center font-medium text-white border-r border-white/10 bg-white/5">My Tokens</button>
                    <Link href="/crypto/tokens" className="flex-1 py-3 text-sm text-center font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Tokens</Link>
                    <button
                        onClick={() => setIsAddWalletOpen(true)}
                        className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/30"
                    >
                        <MdAdd className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                    ) : wallets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 gap-3">
                            <p className="text-gray-400 text-sm">No tokens found</p>
                            <Link
                                href="/crypto/receive/crypto-wallet/add-wallet"
                                className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                            >
                                Add Wallet
                            </Link>
                        </div>
                    ) : (
                        wallets.map((wallet: any, index: number) => {
                            const currency = wallet.currency;
                            const symbol = currency?.code || currency?.ticker || "UNKNOWN";
                            const config = getAssetConfig(symbol);
                            // Use availableBalance from API, with fallback. Handles scientific notation naturally in JS usually, 
                            // but explicitly parsing can be safer if it's a string. 
                            // API returns numbers like 0E-8 which JS treats as 0.
                            const rawBalance = wallet.availableBalance ?? wallet.totalBalance ?? 0;
                            const balance = Number(rawBalance).toLocaleString('en-US', { maximumFractionDigits: 8 });

                            // Format USD equivalent
                            const usdValue = wallet.usdEquivalent
                                ? Number(wallet.usdEquivalent).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                })
                                : "$0.00";

                            return (
                                <TokenItem
                                    key={wallet.walletId || index}
                                    id={symbol.toLowerCase()}
                                    icon={<div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>{config.icon}</div>}
                                    name={currency?.name || config.name}
                                    symbol={symbol}
                                    amount={`${balance} ${symbol}`}
                                    value={usdValue}
                                />
                            );
                        })
                    )}
                </div>

                <div className="p-3 border-t border-white/10">
                    <Link href="" className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors">
                        See more
                    </Link>
                </div>
            </div>

            {/* Recent Transactions */}
            <div>
                <h3 className="font-semibold mb-4">Recent transactions</h3>
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center">
                        {/* Placeholder illustration for wallet */}
                        <Image src={NoTransaction} className="mb-3" alt="No Transaction" width={200} height={200} />
                        <p className="text-gray-500 font-[600] text-[2rem] -mt-18 mb-16">No Transaction Yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {transactions.map((tx) => {
                            const Icon = getIcon(tx.source);
                            const isNegative = ["send", "withdrawal", "bill", "electricity", "card"].includes(tx.source.toLowerCase());
                            return (
                                <div
                                    key={tx.id}
                                    className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-xl p-4 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/crypto/activity/${tx.reference}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium capitalize">{tx.source}</span>
                                            <span className="text-gray-500 text-xs truncate max-w-[150px]">
                                                {tx.status} • {format(parseISO(tx.createdAt), "MMM dd, HH:mm")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`font-medium ${isNegative ? "text-red-500" : "text-green-500"}`}>
                                            {isNegative ? "-" : "+"}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                        </span>
                                        <span className={`text-[10px] uppercase font-bold ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Add Wallet Modal */}
            {isAddWalletOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] w-full max-w-md rounded-2xl border border-white/10 p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsAddWalletOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <IoClose className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-6">Add New Wallet</h2>

                        <WalletForm onSuccess={() => {
                            setIsAddWalletOpen(false);
                            setLoading(true);
                            fetchWallets();
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionButton({
    icon: Icon,
    label,
    href,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center gap-2 bg-app-card py-4 rounded-2xl active:scale-95 transition-transform border border-white/10 bg-gradient-to-b from-[#1E1E1E] to-[#121212]"
        >
            <Icon className="w-6 h-6 text-white" />
            <span className="text-[10px] text-gray-300 font-medium">{label}</span>
        </Link>
    );
}

function TokenItem({ id, icon, name, symbol, amount, value }: { id: string, icon: React.ReactNode, name: string, symbol: string, amount: string, value: string }) {
    return (
        // TODO: Re-enable token detail route later
        // <Link
        //     href={`/crypto/tokens/${id}`}
        //     className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
        // >
        <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
                {icon}
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{name}</span>
                    <span className="text-xs text-gray-400">{symbol}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-medium text-sm">{amount}</span>
                <span className="text-xs text-gray-500">{value}</span>
            </div>
        </div>
        // </Link>
    )
}
