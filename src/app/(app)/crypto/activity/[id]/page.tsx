"use client";

import React, { useRef, useState } from "react";
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

import { useQuery } from "@tanstack/react-query";

import { fetchAllActivities, type ActivityItem } from "@/services/activity";
import { getRecentTransactions } from "@/services/user";
import { printReceipt } from "@/utils/printReceipt";

interface ActivityReceiptProps {
    copied: boolean;
    formattedDate: string;
    isNegative: boolean;
    onCopy: (text: string) => void;
    transaction: ActivityItem;
}

function getTransactionDirection(transaction: ActivityItem) {
    if (transaction.direction) return transaction.direction.toUpperCase();

    return ["send", "withdrawal", "bill", "bill_payment", "electricity", "card", "transfer"].includes(
        transaction.source.toLowerCase()
    )
        ? "DEBIT"
        : "CREDIT";
}

function getIcon(source: string, direction: string | null) {
    const normalizedDirection = direction?.toUpperCase();

    switch (source.toLowerCase()) {
        case "send":
        case "withdrawal":
        case "transfer":
            return normalizedDirection === "CREDIT"
                ? HiOutlineArrowDownLeft
                : HiOutlineArrowUpRight;
        case "receive":
        case "deposit":
            return HiOutlineArrowDownLeft;
        case "swap":
        case "convert":
            return HiOutlineArrowPath;
        case "bill":
        case "bill_payment":
        case "electricity":
            return HiOutlineLightBulb;
        case "card":
            return HiOutlineCreditCard;
        default:
            if (normalizedDirection === "CREDIT") return HiOutlineArrowDownLeft;
            if (normalizedDirection === "DEBIT") return HiOutlineArrowUpRight;
            return HiOutlineInbox;
    }
}

const getTransactionsFromResponse = (response: any): ActivityItem[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

function getTransactionDate(createdAt: string | null) {
    if (!createdAt) return null;

    const date = parseISO(createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getTransactionLabel(transaction: ActivityItem) {
    if (transaction.details?.transactionType) return transaction.details.transactionType;

    return transaction.source
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDetailsHeading(source: string) {
    switch (source.toLowerCase()) {
        case "bill":
        case "bill_payment":
            return "Bill Details";
        case "transfer":
            return "Transfer Details";
        default:
            return "Transaction Details";
    }
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
        case "success":
        case "successful": // what the API actually returns
        case "posted":
            return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "pending":
        case "processing":
            return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        case "failed":
        case "cancelled":
        case "reversed":
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
    const Icon = getIcon(transaction.source, transaction.direction);
    const fee = transaction.fee ?? 0;

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
                    <p className="text-gray-400 text-sm capitalize mb-2">
                        {getTransactionLabel(transaction)}
                    </p>
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
                            <span className="text-gray-400">Source</span>
                            <span className="text-white font-medium">{getTransactionLabel(transaction)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Direction</span>
                            <span className="text-white font-medium">{getTransactionDirection(transaction)}</span>
                        </div>
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
                            <span className="text-white font-medium">
                                {fee.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 8,
                                })}
                            </span>
                        </div>
                        {fee > 0 && <div className="h-px bg-white/10 my-1"></div>}
                        {fee > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 font-medium">Total</span>
                                <span className="text-white font-semibold">
                                    {(transaction.amount + fee).toLocaleString(undefined, {
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

                {transaction.details && Object.keys(transaction.details).length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs uppercase font-semibold">
                            {getDetailsHeading(transaction.source)}
                        </span>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col gap-3 text-sm">
                            {transaction.details.transactionType && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Transaction Type</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.transactionType}
                                    </span>
                                </div>
                            )}
                            {transaction.details.senderName && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Sender Name</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.senderName}
                                    </span>
                                </div>
                            )}
                            {transaction.details.recipientName && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Recipient Name</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.recipientName}
                                    </span>
                                </div>
                            )}
                            {transaction.details.productName && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Product</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.productName}
                                    </span>
                                </div>
                            )}
                            {transaction.details.phone && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Phone Number</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.phone}
                                    </span>
                                </div>
                            )}
                            {transaction.details.price && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Price</span>
                                    <span className="text-white font-medium">
                                        ₦{transaction.details.price}
                                    </span>
                                </div>
                            )}
                            {transaction.details.quoteBill && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Bill Type</span>
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
                                    <span className="text-gray-400">Purchase Value (NGN)</span>
                                    <span className="text-white font-medium">
                                        ₦{transaction.details.purchaseValueNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                            {transaction.details.transactionId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Transaction ID</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono text-xs truncate max-w-[150px]">
                                            {transaction.details.transactionId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onCopy(transaction.details!.transactionId!)}
                                            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                                        >
                                            <IoCopyOutline className="w-3 h-3 text-gray-400 hover:text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {transaction.details.requestId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Request ID</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono text-xs truncate max-w-[150px]">
                                            {transaction.details.requestId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onCopy(transaction.details!.requestId!)}
                                            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                                        >
                                            <IoCopyOutline className="w-3 h-3 text-gray-400 hover:text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {transaction.details.quoteProviderParams?.variation_code && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Variation Code</span>
                                    <span className="text-white font-medium">
                                        {transaction.details.quoteProviderParams.variation_code}
                                    </span>
                                </div>
                            )}
                            
                            {/* Display all other fields that haven't been explicitly handled */}
                            {Object.entries(transaction.details)
                                .filter(([key]) => !['transactionType', 'senderName', 'recipientName', 'productName', 'phone', 'price', 'quoteBill', 'serviceIdentifier', 'purchaseValueNgn', 'transactionId', 'requestId', 'quoteProviderParams'].includes(key))
                                .map(([key, value]) => {
                                    // Skip null, undefined, or empty values
                                    if (value === null || value === undefined || value === '') return null;
                                    
                                    // Skip objects (we handle them separately)
                                    if (typeof value === 'object') return null;
                                    
                                    // Format the key to be more readable
                                    const formattedKey = key
                                        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                                        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                                        .trim();
                                    
                                    // Format the value
                                    let formattedValue = String(value);
                                    
                                    return (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-gray-400">{formattedKey}</span>
                                            <span className="text-white font-medium break-all text-right max-w-[60%]">
                                                {formattedValue}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ) : (
                    // The API sends `details: {}` for some rows (transfers in
                    // particular), so say so rather than rendering nothing and
                    // leaving the receipt looking broken.
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-400 text-xs uppercase font-semibold">
                            {getDetailsHeading(transaction.source)}
                        </span>
                        <p className="text-gray-500 text-sm bg-white/5 rounded-lg p-3 border border-white/10">
                            No further details were recorded for this transaction.
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
    const [copied, setCopied] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    const matches = (item: ActivityItem) =>
        item.reference === id || String(item.id) === id;

    // Same key and fetcher as the activity list, so arriving from there is served
    // straight from cache instead of refetching every wallet's activity again.
    const {
        data: activities = [],
        isLoading: activitiesLoading,
        isError: activitiesError,
    } = useQuery({
        queryKey: ['allActivities'],
        queryFn: fetchAllActivities,
    });

    const fromActivities = activities.find(matches) ?? null;

    // HomePage and CryptoPage link here using their own recent-transactions data,
    // which can hold references that wallet activity doesn't, so fall back to it
    // only when the lookup above comes up empty.
    const {
        data: recentTransactions = [],
        isLoading: recentLoading,
        isError: recentError,
    } = useQuery({
        queryKey: ['recentTransactions', 'activityFallback'],
        queryFn: async () => getTransactionsFromResponse(await getRecentTransactions()),
        enabled: !activitiesLoading && !fromActivities,
    });

    const transaction = fromActivities ?? recentTransactions.find(matches) ?? null;
    const loading = activitiesLoading || recentLoading;
    const error = !loading && !transaction
        ? activitiesError || recentError
            ? "Failed to load transaction details"
            : "Transaction not found"
        : "";

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

    const transactionDate = getTransactionDate(transaction.createdAt);
    const formattedDate = transactionDate
        ? format(transactionDate, "MMM dd, yyyy '|' HH:mm:ss")
        : "Unknown date";
    const isNegative = getTransactionDirection(transaction) === "DEBIT";

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
