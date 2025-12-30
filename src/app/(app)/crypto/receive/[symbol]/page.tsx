"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { IoCopyOutline, IoShareOutline } from "react-icons/io5";
import QrCodeImg from "../../../../../../public/qrcode.png";
import { getWallets } from "@/services/wallet";

export default function ReceiveAssetPage({ params }: { params: Promise<{ symbol: string }> }) {
    const router = useRouter();
    const { symbol } = React.use(params);
    const [copied, setCopied] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await getWallets();
                const walletList = Array.isArray(response) ? response : response.data || [];

                const foundWallet = walletList.find((w: any) => {
                    const wSymbol = w.currency?.code || w.currency?.ticker || w.currency || "";
                    return wSymbol.toLowerCase() === symbol.toLowerCase();
                });

                if (foundWallet) {
                    setWallet(foundWallet);
                } else {
                    setError(`No ${symbol.toUpperCase()} wallet found.`);
                }
            } catch (err) {
                console.error("Error fetching wallet:", err);
                setError("Failed to load wallet information.");
            } finally {
                setLoading(false);
            }
        };

        fetchWallet();
    }, [symbol]);

    const displaySymbol = symbol.toUpperCase();
    // API returns addresses array. We take the first active one or just the first one.
    // The sample JSON showed "address": null, so we must handle that case gracefully.
    const activeAddress = wallet?.addresses?.find((a: any) => a.isActive)?.address || wallet?.addresses?.[0]?.address;
    const address = activeAddress || "Address not generated";
    // Check if the API provides a QR Code URL, otherwise fallback to the static one
    // Note: If the backend doesn't provide a specific QR code, this static one is used as a placeholder.
    // Ideally, we should use a QR code library to generate it from the address.
    const qrCodeSrc = wallet?.qrCodeUrl || QrCodeImg;

    const handleCopy = () => {
        if (address && address !== "Address not available") {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = () => {
        if (navigator.share && address && address !== "Address not available") {
            navigator.share({
                title: `Receive ${displaySymbol}`,
                text: `My ${displaySymbol} address: ${address}`,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 items-center justify-center px-4">
                <header className="relative w-full flex items-center justify-center px-4 py-6 mb-4 absolute top-0">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                    >
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Receive</h1>
                </header>
                <div className="text-red-500 text-center">{error}</div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-6 py-2 bg-white/10 rounded-full text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6 pb-24">
            {/* Header */}
            <header className="relative flex items-center justify-center px-4 py-6 mb-4">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Receive {displaySymbol}</h1>
            </header>

            <div className="flex flex-col items-center px-6 gap-8">
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-3xl">
                    <Image
                        src={qrCodeSrc}
                        alt={`${displaySymbol} QR Code`}
                        width={200}
                        height={200}
                        className="w-48 h-48"
                    />
                </div>

                {/* Address Container */}
                <div className="w-full flex flex-col gap-2">
                    <span className="text-gray-400 text-sm text-center">Wallet Address ({displaySymbol})</span>
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <span className="text-white font-mono text-sm break-all">{address}</span>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                            disabled={address === "Address not available"}
                        >
                            <IoCopyOutline className="text-white w-5 h-5" />
                        </button>
                    </div>
                    {copied && <p className="text-green-500 text-xs text-center animate-fade-in">Address copied!</p>}
                </div>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="w-full py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50"
                    disabled={!address || address === "Address not available"}
                >
                    <IoShareOutline className="w-5 h-5" />
                    Share Address
                </button>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-500 text-xs text-center leading-relaxed">
                        Send only <strong>{displaySymbol}</strong> to this address. Sending any other asset may result in permanent loss.
                    </p>
                </div>
            </div>
        </div>
    );
}
