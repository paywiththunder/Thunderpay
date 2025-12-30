"use client";
import React from "react";
import AppHeader from "./AppHeader";
import Link from "next/link";
import Image from "next/image";
import NoTransaction from "../../../public/walletimg.png";
import Right from '../../../public/right.png';
import Left from '../../../public/left.png';
import { HiOutlineGlobeAlt, HiArrowUpRight, HiArrowDownLeft, HiArrowsRightLeft } from "react-icons/hi2";

export default function InternationalPage() {
    const isComingSoon = true;

    return (
        <div className="flex flex-col gap-5 w-full pb-20">
            <AppHeader />

            <div className="relative">
                {/* Content with optional blur */}
                <div className={`flex flex-col gap-5 transition-all duration-500 ${isComingSoon ? "blur-[2px] pointer-events-none opacity-60" : ""}`}>
                    {/* Cards Scroll Container */}
                    <div className="flex flex-col gap-4">
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-6 px-6 no-scrollbar">
                            {/* US Card */}
                            <div className="snap-center shrink-0 w-full relative h-40 bg-gradient-to-r from-[#D92D4C] to-[#991B33] rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-lg">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="flex items-center gap-2 z-10">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white">
                                        <span className="text-lg leading-none">🇺🇸</span>
                                    </div>
                                    <span className="text-white/90 text-sm font-medium">Total assets</span>
                                    <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center text-[10px] text-white/50">i</div>
                                </div>

                                <div className="z-10">
                                    <h2 className="text-4xl font-bold text-white">$0.00</h2>
                                </div>
                            </div>

                            {/* UK Card */}
                            <div className="snap-center shrink-0 w-full relative h-40 bg-gradient-to-r from-[#4C9EEB] to-[#2D5FD9] rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-lg opacity-90">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="flex items-center gap-2 z-10">
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white">
                                        <span className="text-lg leading-none">🇬🇧</span>
                                    </div>
                                    <span className="text-white/90 text-sm font-medium">Total assets</span>
                                    <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center text-[10px] text-white/50">i</div>
                                </div>

                                <div className="z-10">
                                    <h2 className="text-4xl font-bold text-white">£0.00</h2>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex items-center justify-center gap-1.5">
                            <div className="w-4 h-1.5 bg-white rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 px-4">
                        <ActionButton icon={HiArrowUpRight} label="Send" href="/international/send" />
                        <ActionButton icon={HiArrowDownLeft} label="Receive" href="/international/receive" />
                        <ActionButton icon={HiArrowsRightLeft} label="Convert" href="/international/convert" />
                    </div>

                    {/* Banner */}
                    <div className="w-full h-20 rounded-xl overflow-hidden relative bg-gradient-to-r from-blue-500 to-purple-600 flex items-center px-4 mt-2">
                        <Image src={Right} width={150} height={150} alt="Banner Pattern" className="absolute top-0 left-0 object-cover opacity-50" />
                        <div className="flex-1 z-10 flex items-center justify-between">
                            <div className="flex flex-col">
                                <p className="font-bold text-white text-base">Pay Smarter. Pay in Crypto.</p>
                                <p className="text-[10px] text-blue-100">No Banks. No Hassle. Just Crypto Coins.</p>
                            </div>
                        </div>
                        <Image src={Left} width={150} height={150} alt="Banner Pattern" className="absolute top-0 right-0 object-cover opacity-50" />
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-4">
                        <h3 className="font-semibold text-white mb-6">Recent transactions</h3>
                        <div className="flex flex-col items-center justify-center py-10">
                            <Image src={NoTransaction} className="mb-4 opacity-80" alt="No Transaction" width={140} height={140} />
                            <p className="text-white/30 font-bold text-xl">No Transaction Yet</p>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Overlay */}
                {isComingSoon && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                                <HiOutlineGlobeAlt className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Global Accounts Coming Soon</h3>
                            <p className="text-gray-400 text-sm max-w-[250px]">
                                We're working on bringing you USD, GBP, and EUR bank accounts for your international payments.
                            </p>
                            <div className="mt-6 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                                <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">In Progress</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[#1C1C1E] border border-white/10 active:scale-95 transition-transform"
        >
            <Icon className="w-6 h-6 text-white mb-2" />
            <span className="text-xs text-gray-400 font-medium">{label}</span>
        </Link>
    );
}
