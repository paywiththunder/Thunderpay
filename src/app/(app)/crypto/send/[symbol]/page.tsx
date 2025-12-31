"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiCheckCircle, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { FaBitcoin, FaEthereum, FaWallet } from "react-icons/fa";
import { SiTether, SiSolana } from "react-icons/si";
import { getWallets, getCurrencies } from "@/services/wallet";
import { getTransferQuote, executeTransfer } from "@/services/transfer";
import { toast } from "react-hot-toast";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";

type Step = "address" | "amount" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

const getAssetConfig = (symbol: string) => {
    switch (symbol.toUpperCase()) {
        case "USDT":
            return { icon: SiTether, color: "text-green-500", name: "Tether" };
        case "BTC":
            return { icon: FaBitcoin, color: "text-orange-500", name: "Bitcoin" };
        case "ETH":
            return { icon: FaEthereum, color: "text-purple-400", name: "Ethereum" };
        case "SOL":
            return { icon: SiSolana, color: "text-cyan-400", name: "Solana" };
        default:
            return { icon: FaWallet, color: "text-gray-400", name: symbol };
    }
};



export default function AssetSendPage({ params }: { params: Promise<{ symbol: string }> }) {
    const router = useRouter();
    const { symbol: rawSymbol } = React.use(params);
    const symbol = rawSymbol.toUpperCase();
    const config = getAssetConfig(symbol);

    const [step, setStep] = useState<Step>("address");
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isFiat, setIsFiat] = useState(true);
    const [isRecentsOpen, setIsRecentsOpen] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [currencyId, setCurrencyId] = useState<number | null>(null);

    const [quote, setQuote] = useState<any>(null);
    const [isQuoting, setIsQuoting] = useState(false);
    const [transactionResult, setTransactionResult] = useState<TransactionResult>(null);
    const [transactionToken, setTransactionToken] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch wallets and currencies in parallel to ensure we have all data "on ground"
                const [walletResponse, currencyResponse] = await Promise.all([
                    getWallets(),
                    getCurrencies()
                ]);

                // Process Wallet Data
                const walletList = Array.isArray(walletResponse) ? walletResponse : walletResponse.data || [];
                const foundWallet = walletList.find((w: any) => (w.currency?.code || w.currency?.ticker || "").toUpperCase() === symbol);
                console.log("Found wallet for send:", foundWallet);
                setWallet(foundWallet);

                // Process Currency Data
                const currencyList = Array.isArray(currencyResponse) ? currencyResponse : currencyResponse.data || [];
                const foundCurrency = currencyList.find((c: any) => (c.code || c.ticker || "").toUpperCase() === symbol);
                if (foundCurrency) {
                    setCurrencyId(foundCurrency.currencyId);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            }
        };
        fetchData();
    }, [symbol]);

    const handleCopyRecent = (addr: string) => {
        setAddress(addr);
        setIsRecentsOpen(false);
    };

    const handleContinueToAmount = () => {
        if (address) setStep("amount");
    };

    const handleGetQuote = async () => {
        if (!wallet) {
            toast.error("Wallet not found");
            return;
        }

        setIsQuoting(true);
        setStep("confirmation");

        try {
            const activeAddress = wallet.addresses?.find((a: any) => a.isActive) || wallet.addresses?.[0];
            const network = activeAddress?.chainCode || activeAddress?.network;

            if (!network) {
                toast.error("Wallet network information missing");
                setStep("amount");
                return;
            }

            const getNetworkId = (code: string) => {
                const upper = code?.toUpperCase();
                if (upper === "TRX") return "TRC20";
                if (upper === "ETH") return "ERC20";
                if (upper === "BSC") return "BEP20";
                if (upper === "SOL") return "SOLANA";
                return code;
            };

            const amountNum = parseFloat(amount) || 0;
            if (amountNum <= 0) {
                toast.error("Please enter a valid amount");
                setStep("amount");
                return;
            }

            const networkId = getNetworkId(network);
            console.log("Using network ID:", networkId);

            if (!currencyId) {
                toast.error("Currency information missing");
                setStep("amount");
                return;
            }

            const payload = {
                scope: "EXTERNAL_WALLET" as const,
                walletId: Number(wallet.walletId),
                amount: Number(amountNum),
                fixedSide: "SOURCE" as const,
                recipientAddress: address,
                network: networkId,
                toCurrencyId: Number(currencyId),
            };

            console.log("Fetching transfer quote with payload:", payload);
            const response = await getTransferQuote(payload);
            if (response.success) {
                setQuote(response.data);
            } else {
                toast.error(response.description || "Failed to get quote");
                setStep("amount");
            }
        } catch (error: any) {
            console.error("Quote error details:", error);
            const errorMsg = error.description || error.message || error.error || "Error fetching quote";
            toast.error(errorMsg);
            setStep("amount");
        } finally {
            setIsQuoting(false);
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (!quote) return;
        try {
            const payload = {
                quoteReference: quote.quoteReference,
                recipientIdentifier: address,
                pin: pin,
            };
            console.log("Executing transfer with payload:", payload);
            const response = await executeTransfer(payload);
            console.log("Transfer response:", response);
            if (response.success) {
                setTransactionToken(response.data?.transactionReference || "");
                setTransactionResult("success");
            } else {
                toast.error(response.description || "Transfer failed");
                setStep("confirmation");
                return;
            }
        } catch (error: any) {
            toast.error(error.description || "Transaction failed");
            setTransactionResult("failure");
        }
        setStep("result");
    };

    const formatShortAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 4)}*****${addr.slice(-3)}`;
    };

    if (step === "confirmation") {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
                <header className="relative flex items-center justify-center px-4 py-6">
                    <button onClick={() => setStep("amount")} className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20">
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Confirmation</h1>
                </header>

                <div className="flex flex-col gap-6 px-4 mt-8">
                    <div className="bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-gray-400 text-sm">Amount:</span>
                            <h2 className="text-5xl font-bold text-white leading-tight">
                                {quote?.totalDebit.toLocaleString()} <span className="text-2xl font-normal text-gray-500">{symbol}</span>
                            </h2>
                            <p className="text-gray-400 text-lg">≈ ${parseFloat(amount).toLocaleString()}</p>
                        </div>

                        <div className="flex flex-col gap-5 border-t border-white/5 pt-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">To</span>
                                <span className="text-white font-mono">{formatShortAddress(address)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Network</span>
                                <span className="text-white font-medium">{config.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Fee</span>
                                <span className="text-white font-medium">$1.00</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep("enterPin")}
                        disabled={isQuoting}
                        className="w-full py-5 rounded-full bg-[#1C1C1E] text-white font-bold text-lg mt-8 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isQuoting ? "Calculating..." : "Send"}
                    </button>
                </div>
            </div>
        );
    }

    if (step === "enterPin") {
        return <EnterPin onBack={() => setStep("confirmation")} onComplete={handlePinComplete} />;
    }

    if (step === "result") {
        const paymentAmount = quote ? `${quote.totalDebit.toLocaleString()} ${symbol}` : "0";
        if (transactionResult === "success") {
            return (
                <PaymentSuccess
                    title="Transfer Successful"
                    amount={paymentAmount}
                    amountEquivalent={`≈ ${isFiat ? "$" : ""}${parseFloat(amount).toLocaleString()} ${isFiat ? symbol : ""}`}
                    token={transactionToken}
                    biller={config.name}
                    billerLabel="Asset"
                    meterNumber={address}
                    meterNumberLabel="Wallet Address"
                    customerName="External Wallet"
                    customerNameLabel="Recipient"
                    meterType="Crypto Transfer"
                    meterTypeLabel="Transaction Type"
                    serviceAddress=""
                    paymentMethod={`${config.name} Wallet`}
                    bonusEarned="0.00 Cashback"
                    transactionDate={new Date().toLocaleString()}
                    onAddToBeneficiary={() => { }}
                    onContinue={() => router.push("/crypto/send")}
                />
            );
        }
        return (
            <PaymentFailure
                amount={paymentAmount}
                amountEquivalent={`≈ ${isFiat ? "$" : ""}${parseFloat(amount).toLocaleString()} ${isFiat ? symbol : ""}`}
                failureReason="Transaction failed"
                biller={config.name}
                billerLabel="Asset"
                meterNumber={address}
                meterNumberLabel="Wallet Address"
                customerName="External Wallet"
                customerNameLabel="Recipient"
                meterType="Crypto Transfer"
                meterTypeLabel="Transaction Type"
                serviceAddress=""
                paymentMethod={`${config.name} Wallet`}
                transactionDate={new Date().toLocaleString()}
                onContinue={() => setStep("address")}
            />
        );
    }

    if (step === "amount") {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
                <header className="relative flex items-center justify-center px-4 py-6">
                    <button onClick={() => setStep("address")} className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20">
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Send {config.name}</h1>
                </header>

                <div className="flex flex-col items-center px-6 mt-6 gap-10">
                    {/* Recipient Address Pill */}
                    <div className="flex flex-col items-start gap-2 w-full max-w-[90%]">
                        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-1">Recipient Address</span>
                        <div className="w-full bg-[#1C1C1E] rounded-full py-3 px-5 border border-white/5 truncate flex items-center justify-between">
                            <span className="text-white text-xs font-mono truncate mr-4">{address}</span>
                        </div>
                    </div>

                    {/* Amount Input with Toggles */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium">Amount:</span>
                        <div className="flex items-center gap-3">
                            <span className="text-6xl font-bold text-white">{isFiat ? "$" : ""}</span>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                                placeholder="0.00"
                                className="bg-transparent text-6xl font-bold text-white w-[200px] outline-none placeholder-gray-800 text-center"
                            />
                            {!isFiat && <span className="text-3xl font-medium text-gray-500 self-end mb-2">{symbol}</span>}
                            <button
                                onClick={() => setAmount(wallet?.availableBalance || "0")}
                                className="bg-white/10 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest h-fit hover:bg-white/20 active:scale-95 transition-all"
                            >
                                MAX
                            </button>
                        </div>

                        <button
                            onClick={() => setIsFiat(!isFiat)}
                            className="flex items-center gap-4 text-gray-500 mt-4 group"
                        >
                            <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                                </svg>
                            </div>
                            <span className="text-xl font-medium">0.00 {isFiat ? symbol : "$"}</span>
                        </button>
                    </div>

                    <button
                        onClick={handleGetQuote}
                        disabled={!amount || parseFloat(amount) <= 0}
                        className="w-full py-5 rounded-full bg-[#1C1C1E] text-white font-bold text-lg mt-10 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
            <header className="relative flex items-center justify-center px-4 py-6">
                <button onClick={() => router.back()} className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20">
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">Send {config.name}</h1>
            </header>

            <div className="flex flex-col items-center px-6 mt-10 gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <config.icon className={`w-12 h-12 ${config.color}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{config.name}</h2>
                </div>

                <div className="w-full flex flex-col gap-2 relative">
                    <label className="text-white font-medium text-sm ml-1">{config.name} Address</label>
                    <div className={`p-4 rounded-2xl bg-black border ${isRecentsOpen ? "border-blue-500" : "border-white/10"} flex flex-col gap-3 transition-all`}>
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder={`input recipient ${config.name.toLowerCase()} address`}
                                className="bg-transparent text-white placeholder-gray-800 outline-none flex-grow text-sm"
                            />
                            <button onClick={() => setIsRecentsOpen(!isRecentsOpen)} className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                                See Recents {isRecentsOpen ? <HiChevronUp /> : <HiChevronDown />}
                            </button>
                        </div>

                        {isRecentsOpen && (
                            <div className="flex flex-col gap-2 mt-2 border-t border-white/5 pt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-gray-500 text-xs text-center py-2">No recent addresses</p>
                                <button className="text-blue-500 text-xs font-medium self-end mt-2">See Beneficiaries &gt;</button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleContinueToAmount}
                    disabled={!address}
                    className="w-full py-5 rounded-full bg-[#1C1C1E] text-white font-bold text-lg mt-auto disabled:opacity-50"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
