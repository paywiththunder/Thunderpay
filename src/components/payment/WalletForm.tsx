"use client";
import React, { useState } from "react";
import { ChevronDown, Loader2, Wallet } from "lucide-react";
import { createWallet, getCurrencies } from "@/services/wallet";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

interface WalletFormProps {
    onSuccess?: () => void;
}

export default function WalletForm({ onSuccess }: WalletFormProps = {}) {
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
    const [createdWallet, setCreatedWallet] = useState<boolean>(false);
    const [creationError, setCreationError] = useState("");

    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch Currencies with useQuery
    const { data: currenciesData, isLoading: initialLoading } = useQuery({
        queryKey: ['currencies'],
        queryFn: getCurrencies,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const currencies = currenciesData?.success ? currenciesData.data : [];

    // Effect to set defaults once loaded
    React.useEffect(() => {
        if (currencies.length > 0 && !selectedCurrency) {
            const firstCurrency = currencies[0];
            setSelectedCurrency(firstCurrency);
            if (firstCurrency.networks && firstCurrency.networks.length > 0) {
                setSelectedNetwork(firstCurrency.networks[0]);
            }
        }
    }, [currencies, selectedCurrency]);

    const handleCurrencyChange = (currency: Currency) => {
        setSelectedCurrency(currency);
        if (currency.networks && currency.networks.length > 0) {
            setSelectedNetwork(currency.networks[0]);
        } else {
            setSelectedNetwork(null);
        }
    };

    // Mutation for Wallet Creation
    const createWalletMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCurrency || !selectedNetwork) throw new Error("Invalid selection");
            return await createWallet(selectedCurrency.currencyId, selectedNetwork.chainCode);
        },
        onSuccess: (data) => {
            if (data.success) {
                setCreatedWallet(true);
                // Invalidate wallets query to refresh list in parent components
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                queryClient.invalidateQueries({ queryKey: ['walletsUsd'] });

                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.push("/crypto/receive");
                    }
                }, 2000);
            } else {
                setCreationError(data.description || "Failed to create wallet");
            }
        },
        onError: (error: any) => {
            setCreationError(error?.description || "An error occurred");
        }
    });

    const handleSubmit = () => {
        setCreationError("");
        createWalletMutation.mutate();
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (createdWallet && selectedCurrency) {
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
                {!currencies || currencies.length === 0 ? (
                    <p className="text-gray-400 text-sm">No currencies available.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {currencies.map((currency: Currency) => (
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
                        {selectedCurrency.networks.map((network: Network) => (
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

            {creationError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {creationError}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={createWalletMutation.isPending || !selectedCurrency || !selectedNetwork}
                className="w-full py-4 rounded-full font-bold text-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
            >
                {createWalletMutation.isPending ? (
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
