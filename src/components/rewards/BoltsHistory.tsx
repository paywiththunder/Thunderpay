"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoltsHistory, BoltsTransaction, DEFAULT_CURRENCY_ID } from "@/services/cashback";
import { HiMiniBolt, HiChevronRight } from "react-icons/hi2";

export default function BoltsHistory() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["boltsHistory"],
        queryFn: () => getBoltsHistory({ currencyId: DEFAULT_CURRENCY_ID, page: 0, size: 20 }),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 mt-6">
                <h3 className="text-white font-bold text-lg px-4">Transactions</h3>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="mx-4 bg-white/5 animate-pulse h-16 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    const transactions = data?.data || [];

    return (
        <div className="flex flex-col gap-4 mt-6 pb-20">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-white font-bold text-lg">Recent History</h3>
                <button className="text-blue-500 text-xs font-medium flex items-center gap-1">
                    See All <HiChevronRight className="w-3 h-3" />
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="mx-4 bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-white/5">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <HiMiniBolt className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">No bolt transactions yet.</p>
                    <p className="text-gray-500 text-[10px] mt-1">Start performing transactions to earn Bolts!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 px-4">
                    {transactions.map((tx: BoltsTransaction) => {
                        const isCredit = tx.type === "credit" || tx.type === "EARNED";
                        return (
                            <div key={tx.id} className="bg-linear-to-b from-[#161616] to-[#0A0A0A] border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all hover:bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"}`}>
                                        <HiMiniBolt className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm leading-tight">{tx.description}</span>
                                        <span className="text-gray-500 text-[10px] mt-1">{new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold text-sm ${isCredit ? "text-green-500" : "text-blue-500"}`}>
                                        {isCredit ? "+" : "-"}{tx.amount}
                                    </span>
                                    <span className="text-gray-500 text-[10px] mt-1">Status: {tx.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
