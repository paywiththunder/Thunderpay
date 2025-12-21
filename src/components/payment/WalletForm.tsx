"use client";
import React, { useState } from "react";
import { ChevronDown, Loader2, Wallet } from "lucide-react";
import { createWallet, getCurrencies } from "@/services/wallet";
import { useRouter } from "next/navigation";

interface Network {
    id: number;
    name: string;
    chainCode: string;
    addressMode: string;
    canWithdraw: boolean;
    canSell: boolean;
    createWallet: boolean;
    rpcUrl: string | null;
    canDeposit: boolean;
    isActive: boolean;
    canBuy: boolean;
}

interface Currency {
    currencyId: number;
    code: string;
    name: string;
    isCrypto: boolean;
    symbol: string | null;
    logo: string | null;
    networks: Network[];
}

export default function WalletForm() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const res = await getCurrencies();
                if (res.success && res.data) {
                    setCurrencies(res.data);
                    // Select first currency by default if available
                    if (res.data.length > 0) {
                        const firstCurrency = res.data[0];
                        setSelectedCurrency(firstCurrency);
                        // Select first network if available
                        if (firstCurrency.networks && firstCurrency.networks.length > 0) {
                            setSelectedNetwork(firstCurrency.networks[0]);
                        }
                    }
                } else {
                    setError("Failed to fetch currencies");
                }
            } catch (err) {
                setError("Failed to load currencies");
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    const handleCurrencyChange = (currency: Currency) => {
        setSelectedCurrency(currency);
        if (currency.networks && currency.networks.length > 0) {
            setSelectedNetwork(currency.networks[0]);
        } else {
            setSelectedNetwork(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCurrency || !selectedNetwork) return;

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const res = await createWallet(selectedCurrency.currencyId, selectedNetwork.chainCode);
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

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (success && selectedCurrency) {
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
                {!currencies.length ? (
                    <p className="text-gray-400 text-sm">No currencies available.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {currencies.map((currency) => (
                            <button
                                key={currency.currencyId}
                                onClick={() => handleCurrencyChange(currency)}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left group ${selectedCurrency?.currencyId === currency.currencyId
                                    ? "bg-linear-to-b from-[#2a2a2a] to-[#1a1a1a] border-blue-500/50 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                    : "bg-[#161616] border-[#2B2F33] text-gray-400 hover:border-gray-500 hover:bg-[#1c1c1c]"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedCurrency?.currencyId === currency.currencyId
                                        ? "bg-blue-500 text-white"
                                        : "bg-[#252525] text-gray-400 group-hover:bg-[#333]"
                                        }`}
                                >
                                    {currency.code[0].toUpperCase()}
                                </div>
                                <div>
                                    <span
                                        className={`block font-semibold ${selectedCurrency?.currencyId === currency.currencyId
                                            ? "text-white"
                                            : "text-gray-300"
                                            }`}
                                    >
                                        {currency.code.toUpperCase()}
                                    </span>
                                    <span className="text-xs opacity-60 block">{currency.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedCurrency && selectedCurrency.networks && selectedCurrency.networks.length > 0 && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                        Select Network
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {selectedCurrency.networks.map((network) => (
                            <button
                                key={network.id}
                                onClick={() => setSelectedNetwork(network)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedNetwork?.id === network.id
                                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                                    : "bg-[#161616] border-[#2B2F33] text-gray-400 hover:bg-[#222]"
                                    }`}
                            >
                                {network.chainCode.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading || !selectedCurrency || !selectedNetwork}
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
