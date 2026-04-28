"use client";
import React from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { getWalletsUsd } from "@/services/wallet";
import { useQuery } from "@tanstack/react-query";

export interface PaymentOption {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  balance?: string;
  cryptoAmount?: string;
  value: string;
  type: "fiat" | "crypto";
  currencyCode?: string;
  currency?: string;
  walletId?: number;
  network?: string;
  addresses?: any[];
}

interface PaymentMethodProps {
  onBack: () => void;
  onSelect: (paymentMethod: PaymentOption) => void;
  amount: number;
  walletType?: "crypto" | "fiat" | "all"; // New prop to control which wallets to show
}

const getIconForCurrency = (code: string) => {
  switch (code.toUpperCase()) {
    case "BTC":
    case "BITCOIN":
      return { icon: "B", bg: "bg-orange-500" };
    case "ETH":
    case "ETHEREUM":
      return { icon: "E", bg: "bg-gray-500" };
    case "USDT":
      return { icon: "T", bg: "bg-green-500" };
    case "SOL":
    case "SOLANA":
      return { icon: "S", bg: "bg-gradient-to-br from-purple-500 to-blue-500" };
    case "TRX":
    case "TRON":
      return { icon: "T", bg: "bg-red-500" };
    default:
      return { icon: code[0] || "?", bg: "bg-blue-500" };
  }
};

export default function PaymentMethod({
  onBack,
  onSelect,
  amount,
  walletType = "crypto", // Default to crypto for backward compatibility
}: PaymentMethodProps) {
  const [selectedWallet, setSelectedWallet] = React.useState<PaymentOption | null>(null);

  // Fetch wallets based on the walletType prop
  const { data: walletsResponse, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["walletsUsd", walletType],
    queryFn: () => {
      if (walletType === "all") {
        return getWalletsUsd(); // Get all wallets
      } else {
        return getWalletsUsd(walletType); // Get specific type (crypto or fiat)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const wallets = React.useMemo(() => {
    if (!walletsResponse) return [];

    // Handle the response structure from /wallets/usd endpoint
    const walletList = walletsResponse?.success && walletsResponse?.data?.wallets
      ? walletsResponse.data.wallets
      : [];

    return walletList.map((wallet: any) => {
      const currency = wallet.currency;
      const currencyCode = currency?.code || currency?.ticker || "UNKNOWN";
      const styling = getIconForCurrency(currencyCode);

      const rawBalance = wallet.availableBalance ?? wallet.totalBalance ?? 0;
      const formattedBalance = Number(rawBalance).toLocaleString("en-US", {
        maximumFractionDigits: 8,
      });

      return {
        id: wallet.walletId?.toString() || "",
        name: currency?.name || currencyCode,
        icon: styling.icon,
        iconBg: styling.bg,
        balance: formattedBalance,
        cryptoAmount: `${formattedBalance} ${currencyCode}`,
        value: "---",
        type: "crypto",
        currencyCode: currencyCode,
        currency: currencyCode,
        walletId: wallet.walletId,
        addresses: wallet.addresses || [],
      };
    });
  }, [walletsResponse]);

  const error = queryError ? "Failed to load wallets" : "";

  // Map network codes to standard format expected by API
  const getNetworkId = (code: string | undefined, currencyCode: string) => {
    if (!code) {
      // Default fallback based on currency
      const currUpper = currencyCode.toUpperCase();
      if (currUpper === "USDT") return "trc20"; // Default USDT to TRC20
      if (currUpper === "ETH") return "erc20";
      if (currUpper === "BTC") return "bitcoin";
      if (currUpper === "SOL") return "solana";
      return "trc20"; // Safe default
    }

    const upper = code.toUpperCase();
    // Handle various network naming conventions
    if (upper === "TRX" || upper === "TRON" || upper === "TRC20") return "trc20";
    if (upper === "ETH" || upper === "ETHEREUM" || upper === "ERC20") return "erc20";
    if (upper === "BSC" || upper === "BEP20" || upper === "BINANCE") return "bep20";
    if (upper === "SOL" || upper === "SOLANA") return "solana";
    if (upper === "BTC" || upper === "BITCOIN") return "bitcoin";

    // If already in correct format, return lowercase
    return code.toLowerCase();
  };

  const handleNetworkSelect = (addressObj: any) => {
    if (!selectedWallet) return;

    const networkCode = addressObj.network || addressObj.chainCode;
    const mappedNetwork = getNetworkId(networkCode, selectedWallet.currencyCode || "");

    onSelect({
      ...selectedWallet,
      network: mappedNetwork,
    });
  };

  if (selectedWallet) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => setSelectedWallet(null)}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Select Network</h1>
        </header>

        <div className="px-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${selectedWallet.iconBg} flex items-center justify-center`}>
              <span className="text-white text-lg font-bold">{selectedWallet.icon}</span>
            </div>
            <div>
              <p className="text-white font-medium">{selectedWallet.name}</p>
              <p className="text-gray-400 text-sm">Balance: {selectedWallet.balance}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
          <p className="text-gray-400 text-sm px-1 mb-1">Choose a network for this transaction:</p>
          {selectedWallet.addresses?.map((addr: any, index: number) => (
            <button
              key={index}
              onClick={() => handleNetworkSelect(addr)}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-base uppercase">
                  {addr.network || addr.chainCode || selectedWallet.currencyCode}
                </span>
                <span className="text-gray-500 text-xs font-mono break-all text-left mt-1">
                  {addr.address}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
            </button>
          ))}
          {(!selectedWallet.addresses || selectedWallet.addresses.length === 0) && (
            <button
              onClick={() => handleNetworkSelect({})}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex flex-col items-start">
                <span className="text-white font-medium text-base uppercase">
                  Default Network
                </span>
                <p className="text-gray-500 text-xs mt-1">Use wallet default network</p>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={onBack}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Payment Method</h1>
      </header>

      <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          wallets.map((option: PaymentOption) => (
            <button
              key={option.id}
              onClick={() => {
                if (option.type === "crypto") {
                  setSelectedWallet(option);
                } else {
                  onSelect(option);
                }
              }}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${option.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-lg font-bold">
                    {option.icon}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium text-base">
                    {option.name}
                  </span>
                  {option.cryptoAmount && (
                    <span className="text-gray-400 text-sm">
                      {option.cryptoAmount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                {option.balance ? (
                  <span className="text-white font-medium">{option.balance}</span>
                ) : (
                  <span className="text-white font-medium">{option.value}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
