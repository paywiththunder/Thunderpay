"use client";
import React, { useState } from "react";
import { ChevronDown, Loader2, Wallet } from "lucide-react";
import { createWallet } from "@/services/wallet";
import { useRouter } from "next/navigation";

// Hardcoded for now as we don't have an endpoint for available currencies
const AVAILABLE_CURRENCIES = [
    { id: 3, code: "USDT", name: "Tether", networks: ["trc20", "erc20"] },
    { id: 1, code: "BTC", name: "Bitcoin", networks: ["bitcoin"] },
    { id: 2, code: "ETH", name: "Ethereum", networks: ["erc20"] },
    { id: 4, code: "TRX", name: "Tron", networks: ["trc20"] },
];

export default function WalletForm() {
    const [selectedCurrency, setSelectedCurrency] = useState(AVAILABLE_CURRENCIES[0]);
    const [selectedNetwork, setSelectedNetwork] = useState(AVAILABLE_CURRENCIES[0].networks[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleCurrencyChange = (currency: typeof AVAILABLE_CURRENCIES[0]) => {
        setSelectedCurrency(currency);
        setSelectedNetwork(currency.networks[0]); // Reset network to first available
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await createWallet(selectedCurrency.id, selectedNetwork);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/home");
                }, 2000);
            } else {
                setError(res.description || "Failed to create wallet");
            }
        } catch (err: any) {
            setError(err?.description || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <Wallet className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Wallet Created!</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                    Your {selectedCurrency.name} wallet has been successfully created.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                    Select Currency
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_CURRENCIES.map((currency) => (
                        <button
                            key={currency.id}
                            onClick={() => handleCurrencyChange(currency)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left group ${selectedCurrency.id === currency.id
                                ? "bg-linear-to-b from-[#2a2a2a] to-[#1a1a1a] border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                : "bg-[#161616] border-[#2B2F33] text-gray-400 hover:border-gray-500 hover:bg-[#1c1c1c]"
                                }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedCurrency.id === currency.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-[#252525] text-gray-400 group-hover:bg-[#333]"
                                    }`}
                            >
                                {currency.code[0]}
                            </div>
                            <div>
                                <span
                                    className={`block font-semibold ${selectedCurrency.id === currency.id
                                        ? "text-white"
                                        : "text-gray-300"
                                        }`}
                                >
                                    {currency.code}
                                </span>
                                <span className="text-xs opacity-60 block">{currency.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                    Select Network
                </label>
                <div className="flex gap-3">
                    {selectedCurrency.networks.map((network) => (
                        <button
                            key={network}
                            onClick={() => setSelectedNetwork(network)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedNetwork === network
                                ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                : "bg-[#161616] border-[#2B2F33] text-gray-400 hover:bg-[#222]"
                                }`}
                        >
                            {network.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-full font-bold text-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Wallet...</span>
                    </div>
                ) : (
                    "Create Wallet"
                )}
            </button>
        </div>
    );
}
