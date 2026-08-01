"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
    HiOutlineArrowUpRight,
    HiOutlineArrowDownLeft,
    HiOutlineArrowPath,
    HiOutlineLightBulb,
    HiOutlineCreditCard,
    HiOutlineInbox,
} from "react-icons/hi2";
import { fetchAllActivities, type ActivityItem } from "@/services/activity";
import { format, isToday, isYesterday, parseISO } from "date-fns";

import { useQuery } from "@tanstack/react-query";

export default function ActivityPage() {
    const router = useRouter();

    const getTransactionDate = (createdAt: string | null) => {
        if (!createdAt) return null;

        const date = parseISO(createdAt);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const { data: transactions = [], isLoading: loading } = useQuery({
        queryKey: ['allActivities'],
        queryFn: fetchAllActivities,
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
            case "success":
            case "successful": // what the API actually returns
            case "posted":
                return "text-green-500";
            case "pending":
            case "processing":
                return "text-yellow-500";
            case "failed":
            case "cancelled":
            case "reversed":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

    const getTransactionLabel = (tx: ActivityItem) => {
        if (tx.details?.transactionType) return tx.details.transactionType;

        return tx.source
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const formatActivityMeta = (tx: ActivityItem) => {
        return tx.createdAt ? `${tx.direction} • ${tx.createdAt}` : tx.direction;
    };

    if (loading) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black py-6 items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    const groupTransactionsByDate = (txs: ActivityItem[]) => {
        const groups: { [key: string]: ActivityItem[] } = {};
        txs.forEach((tx) => {
            const date = getTransactionDate(tx.createdAt);
            let dateKey = "Unknown date";

            if (date) {
                dateKey = format(date, "MMM dd, yyyy");
                if (isToday(date)) dateKey = "Today";
                if (isYesterday(date)) dateKey = "Yesterday";
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(tx);
        });
        return groups;
    };

    const getIcon = (source: string, direction: string) => {
        switch (source.toLowerCase()) {
            case "send":
            case "withdrawal":
            case "transfer":
                return direction.toUpperCase() === "CREDIT"
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
                if (direction.toUpperCase() === "CREDIT") return HiOutlineArrowDownLeft;
                if (direction.toUpperCase() === "DEBIT") return HiOutlineArrowUpRight;
                return HiOutlineInbox;
        }
    };

    const groupedTransactions = groupTransactionsByDate(transactions);
    const dateKeys = Object.keys(groupedTransactions);

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
            {/* Header */}
            <header className="relative flex items-center justify-center px-4 py-6">
                <h1 className="text-2xl font-bold text-white">Activity</h1>
            </header>

            <div className="flex flex-col gap-6 px-4 overflow-y-auto">
                {dateKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <HiOutlineInbox className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No transactions yet</p>
                    </div>
                ) : (
                    dateKeys.map((dateKey) => (
                        <div key={dateKey} className="flex flex-col gap-3">
                            <h2 className="text-white font-semibold text-lg">{dateKey}</h2>
                            {groupedTransactions[dateKey].map((tx) => {
                                const Icon = getIcon(tx.source, tx.direction);
                                const isNegative = tx.direction.toUpperCase() === "DEBIT";
                                return (
                                    <div
                                        key={tx.reference}
                                        className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-xl p-4 flex items-center justify-between active:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/crypto/activity/${tx.reference}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium capitalize">
                                                    {getTransactionLabel(tx)}
                                                </span>
                                                <span className="text-gray-500 text-xs truncate max-w-[150px]">
                                                    {formatActivityMeta(tx)}
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
                    ))
                )}
            </div>
        </div>
    );
}
