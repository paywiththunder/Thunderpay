import React from "react";
import { FaBitcoin, FaEthereum, FaWallet } from "react-icons/fa";
import { SiTether, SiSolana } from "react-icons/si";
import { IconType } from "react-icons";

interface AssetConfig {
    Icon: IconType;
    bg: string;
    name: string;
    color: string;
}

export const getAssetConfig = (symbol: string): AssetConfig => {
    switch (symbol.toUpperCase()) {
        case "USDT":
            return { Icon: SiTether, bg: "bg-green-500", name: "Tether", color: "text-white" };
        case "BTC":
            return { Icon: FaBitcoin, bg: "bg-orange-500", name: "Bitcoin", color: "text-white" };
        case "ETH":
            return { Icon: FaEthereum, bg: "bg-white", name: "Ethereum", color: "text-gray-800" };
        case "SOL":
            return { Icon: SiSolana, bg: "bg-purple-500", name: "Solana", color: "text-white" };
        default:
            return { Icon: FaWallet, bg: "bg-gray-700", name: symbol, color: "text-white" };
    }
};
