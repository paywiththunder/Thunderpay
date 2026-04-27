"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import {
    HiOutlineArrowUpRight,
    HiOutlineArrowDownLeft,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineCreditCard,
    HiOutlineInbox,
    HiOutlineArrowDownTray,
} from "react-icons/hi2";
import { IoCopyOutline } from "react-icons/io5";
import { format, parseISO } from "date-fns";

import { getWallets, getWalletActivity } from "@/services/wallet";
import { printReceipt } from "@/utils/printReceipt";

interface TransactionDetail {
    id: number;
    source: string;
    amount: number;
    fee: number;
    status: string;
    reference: string;
    walletId: number | null;
    fromAddress: string | null;
    toAddress: string | null;
    createdAt: string;
    details?: any;
}

interface ActivityReceiptProps {
    copied: boolean;
    formattedDate: string;
    isNegative: boolean;
    onCopy: (text: string) => void;
    transaction: TransactionDetail;
}

function getIcon(source: string) {
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
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
        case "success":
            return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "pending":
        case "processing":
            return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        case "failed":
        case "cancelled":
            return "bg-red-500/20 text-red-400 border border-red-500/30";
        default:
            return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
}

function ActivityReceipt({
    copied,
    formattedDate,
    isNegative,
    onCopy,
    transaction,
}: ActivityReceiptProps) {
    const Icon = getIcon(transaction.source);

    return (
        <div
            id="receipt"
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-6 flex flex-col gap-6"
        >
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5">
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                    <p className="text-gray-400 text-sm capitalize mb-2">{transaction.source}</p>
                    <p className={`text-3xl font-bold ${isNegative ? "text-red-500" : "text-green-500"}`}>
                        {isNegative ? "-" : "+"}
                        {transaction.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                        })}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                </div>
            </div>

            <div className="h-px bg-white/10"></div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Reference ID</span>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <span className="text-white font-mono text-sm">{transaction.reference}</span>
                        <button
                            type="button"
                            onClick={() => onCopy(transaction.reference)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <IoCopyOutline className={`w-4 h-4 ${copied ? "text-green-500" : "text-gray-400"}`} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Date & Time</span>
                    <p className="text-white text-sm bg-white/5 rounded-lg p-3 border border-white/10">{formattedDate}</p>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Amount Breakdown</span>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Amount</span>
                            <span className="text-white font-medium">
                                {transaction.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 8,
                                })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Fee</span>
                            <span className="text-white font-medium">{transaction.fee}</span>
                        </div>
                        {transaction.fee > 0 && <div className="h-px bg-white/10 my-1"></div>}
                        {transaction.fee > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 font-medium">Total</span>
                                <span className="text-white font-semibold">
                                    {(transaction.amount + transaction.fee).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 8,
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {transaction.toAddress && (
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs uppercase font-semibold">
                            {isNegative ? "To" : "From"}
                        </span>
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                            <span className="text-white font-mono text-sm break-all">{transaction.toAddress}</span>
                            <button
                                type="button"
                                onClick={() => onCopy(transaction.toAddress!)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                            >
                                <IoCopyOutline className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                        </div>
                    </div>
                )}

                {transaction.source.toLowerCase() === "bill" && transaction.details && (
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs uppercase font-semibold">Bill Details</span>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col gap-2 text-sm">
                            {transaction.details.quoteBill && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Type</span>
                                    <span className="text-white font-medium capitalize">
                                        {transaction.details.quoteBill.toLowerCase()}
                                    </span>
                                </div>
                            )}
                            {transaction.details.serviceIdentifier && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Service</span>
                                    <span className="text-white font-medium capitalize">
                                        {transaction.details.serviceIdentifier.replace(/-/g, " ")}
                                    </span>
                                </div>
                            )}
                            {transaction.details.purchaseValueNgn && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Value (NGN)</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.purchaseValueNgn.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {transaction.walletId && (
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs uppercase font-semibold">Wallet ID</span>
                        <p className="text-white text-sm bg-white/5 rounded-lg p-3 border border-white/10 font-mono">
                            {transaction.walletId}
                        </p>
                    </div>
                )}
            </div>

            <div className="h-px bg-white/10"></div>

            <div className="text-center">
                <p className="text-gray-500 text-xs leading-relaxed">
                    This is your transaction receipt. Please keep this for your records.
                </p>
            </div>
        </div>
    );
}

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);
    const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const walletsResponse = await getWallets();
                const wallets = Array.isArray(walletsResponse) ? walletsResponse : walletsResponse.data || [];

                if (wallets.length === 0) {
                    setError("No wallets found");
                    setLoading(false);
                    return;
                }

                const validWallets = wallets.filter((wallet: any) => wallet.walletId);
                const activityPromises = validWallets.map((wallet: any) => getWalletActivity(wallet.walletId));
                const responses = await Promise.all(activityPromises);

                let foundTransaction: TransactionDetail | null = null;
                responses.forEach((response) => {
                    if (response && response.success && response.data && Array.isArray(response.data.items)) {
                        const matchedTransaction = response.data.items.find((item: any) => item.reference === id);
                        if (matchedTransaction) {
                            foundTransaction = matchedTransaction;
                        }
                    }
                });

                if (foundTransaction) {
                    setTransaction(foundTransaction);
                } else {
                    setError("Transaction not found");
                }
            } catch (err) {
                console.error("Error fetching transaction:", err);
                setError("Failed to load transaction details");
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement) {
            return;
        }

        void printReceipt(receiptElement, "Transaction Receipt");
    };

    if (loading) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
                <header className="relative flex items-center justify-center px-4 py-6 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                    >
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Transaction Details</h1>
                </header>

                <div className="flex items-center justify-center flex-1 px-4">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error || "Transaction not found"}</p>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formattedDate = format(parseISO(transaction.createdAt), "MMM dd, yyyy '|' HH:mm:ss");
    const isNegative = ["send", "withdrawal", "bill", "electricity", "card"].includes(transaction.source.toLowerCase());

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
            <header className="relative flex items-center justify-center px-4 py-6 mb-6">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 hover:bg-white/5 transition-colors"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Transaction Details</h1>
            </header>

            <div className="flex flex-col gap-6 px-4 overflow-y-auto">
                <div ref={receiptRef} data-receipt-root>
                    <ActivityReceipt
                        copied={copied}
                        formattedDate={formattedDate}
                        isNegative={isNegative}
                        onCopy={handleCopy}
                        transaction={transaction}
                    />
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                    <HiOutlineArrowDownTray className="w-5 h-5" />
                    Download Receipt
                </button>
            </div>
        </div>
    );
}
