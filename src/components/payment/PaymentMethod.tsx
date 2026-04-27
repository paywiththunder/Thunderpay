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
  // Fetch wallets based on the walletType prop
  const { data: walletsResponse, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['walletsUsd', walletType],
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

    console.log("🔍 Wallets Response for type:", walletType, JSON.stringify(walletsResponse, null, 2));

    return walletList.map((wallet: any) => {
      console.log("🔍 Processing Wallet for type:", walletType, JSON.stringify(wallet, null, 2));
      
      const currency = wallet.currency;
      const currencyCode = currency?.code || currency?.ticker || "UNKNOWN";
      const styling = getIconForCurrency(currencyCode);

      const rawBalance = wallet.availableBalance ?? wallet.totalBalance ?? 0;
      const formattedBalance = Number(rawBalance).toLocaleString("en-US", { maximumFractionDigits: 8 });

      // Get network from wallet - check multiple possible locations
      const activeAddress = wallet.addresses?.find((a: any) => a.isActive) || wallet.addresses?.[0];
      const networkCode = wallet.network || activeAddress?.network || activeAddress?.chainCode || currency?.network;

      console.log("🔍 Network Detection for", currencyCode, ":");
      console.log("  - wallet.network:", wallet.network);
      console.log("  - activeAddress:", activeAddress);
      console.log("  - activeAddress?.network:", activeAddress?.network);
      console.log("  - activeAddress?.chainCode:", activeAddress?.chainCode);
      console.log("  - currency?.network:", currency?.network);
      console.log("  - Final networkCode:", networkCode);

      // Map network codes to standard format expected by API
      const getNetworkId = (code: string | undefined) => {
        if (!code) {
          // Default fallback based on currency
          const currUpper = currencyCode.toUpperCase();
          if (currUpper === "USDT") return "trc20"; // Default USDT to TRC20
          if (currUpper === "ETH") return "erc20";
          if (currUpper === "BTC") return "bitcoin";
          if (currUpper === "SOL") return "solana";
          console.warn(`⚠️ No network found for ${currencyCode}, using default: trc20`);
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

      const mappedNetwork = getNetworkId(networkCode);
      console.log(`✅ Wallet ${wallet.walletId} - Currency: ${currencyCode}, Raw Network: ${networkCode}, Mapped Network: ${mappedNetwork}`);

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
        network: mappedNetwork,
      };
    });
  }, [walletsResponse]);

  const error = queryError ? "Failed to load wallets" : "";

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
              onClick={() => onSelect(option)}
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
