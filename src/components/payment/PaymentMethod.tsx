"use client";
import React from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi2";
import { getWallets } from "@/services/wallet";

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
}

interface PaymentMethodProps {
  onBack: () => void;
  onSelect: (paymentMethod: PaymentOption) => void;
  amount: number;
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
}: PaymentMethodProps) {
  const [wallets, setWallets] = React.useState<PaymentOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        console.log("Fetched wallets:", response);

        // Assuming response.data is the array of wallets, or response itself is the array
        // Adjust based on actual API shape using the logs
        const walletList = Array.isArray(response) ? response : response.data || [];

        const mappedWallets: PaymentOption[] = walletList.map((wallet: any) => {
          console.log("Raw wallet item:", wallet);
          const currencyCode = wallet.currency?.code || wallet.currency || "UNKNOWN";
          const styling = getIconForCurrency(currencyCode);

          return {
            id: wallet.walletId?.toString() || "", // Prefer explicit ID, avoid random for payments
            name: wallet.currency?.name || currencyCode,
            icon: styling.icon,
            iconBg: styling.bg,
            // Formatting balance if available, otherwise just showing value
            balance: wallet.balance ? `${wallet.balance}` : undefined,
            cryptoAmount: wallet.balance ? `${wallet.balance} ${currencyCode}` : undefined,
            value: "0.00", // valid fiat value would need conversion rate
            type: "crypto", // Assuming mostly crypto for now
            currencyCode: currencyCode,
            currency: currencyCode,
          };
        });

        // Add static Naira if needed, or if backend doesn't return it
        // mappedWallets.unshift({ ...naira... }) 

        setWallets(mappedWallets);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
        setError("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

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
          wallets.map((option) => (
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

