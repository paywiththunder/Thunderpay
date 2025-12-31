"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiCheckCircle } from "react-icons/hi2";
import PaymentMethod, {
    PaymentOption,
} from "@/components/payment/PaymentMethod";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";
import { getTransferQuote, executeTransfer } from "@/services/transfer";
import { toast } from "react-hot-toast";

type Step = "wallet" | "amount" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

const networks = [
    { id: "TRC20", name: "TRON (TRC20)", icon: "T" },
    { id: "ERC20", name: "Ethereum (ERC20)", icon: "E" },
    { id: "BEP20", name: "BSC (BEP20)", icon: "B" },
    { id: "SOLANA", name: "Solana", icon: "S" },
];

const amountOptions = [
    { amount: 1000, cashback: 10 },
    { amount: 5000, cashback: 50 },
    { amount: 10000, cashback: 100 },
    { amount: 50000, cashback: 500 },
];

export default function SendToWalletPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("wallet");
    const [address, setAddress] = useState("");
    const [selectedNetwork, setSelectedNetwork] = useState<string>("TRC20");
    const [amount, setAmount] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentOption | null>(null);
    const [transactionResult, setTransactionResult] =
        useState<TransactionResult>(null);
    const [transactionToken, setTransactionToken] = useState("");
    const [quote, setQuote] = useState<any>(null);
    const [isQuoting, setIsQuoting] = useState(false);

    const generateTransactionToken = (): string => {
        const segments = Array.from({ length: 5 }, () =>
            Math.floor(1000 + Math.random() * 9000).toString()
        );
        return segments.join("-");
    };

    const getCashback = (): number => {
        const amountNum = parseFloat(amount);
        const option = amountOptions.find((opt) => opt.amount === amountNum);
        return option?.cashback || 0;
    };

    const getTransactionDate = (): string => {
        const now = new Date();
        return now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handlePaymentMethodSelect = async (paymentMethod: PaymentOption) => {
        setSelectedPaymentMethod(paymentMethod);
        setIsQuoting(true);
        setStep("confirmation");

        try {
            const payload = {
                scope: "EXTERNAL_WALLET" as const,
                walletId: paymentMethod.walletId!,
                amount: parseFloat(amount),
                fixedSide: "SOURCE" as const,
                recipientAddress: address,
                network: selectedNetwork,
                // toCurrencyId: ... would need to know the target currency, assuming matching source for now or default
            };
            const response = await getTransferQuote(payload);
            if (response.success) {
                setQuote(response.data);
            } else {
                toast.error(response.description || "Failed to get quote");
                setStep("payment");
            }
        } catch (error: any) {
            toast.error(error.description || "Error fetching quote");
            setStep("payment");
        } finally {
            setIsQuoting(false);
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (!quote) return;

        try {
            const payload = {
                quoteReference: quote.quoteId.toString(),
                recipientIdentifier: address,
                pin: pin,
            };

            const response = await executeTransfer(payload);
            if (response.success) {
                setTransactionToken(response.data?.transactionReference || generateTransactionToken());
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

    const handleContinueFromResult = () => {
        router.push("/crypto/send");
    };

    if (step === "payment") {
        return (
            <PaymentMethod
                onBack={() => setStep("amount")}
                onSelect={handlePaymentMethodSelect}
                amount={parseFloat(amount) || 0}
            />
        );
    }

    if (step === "confirmation" && selectedPaymentMethod) {
        return (
            <Confirmation
                onBack={() => setStep("payment")}
                onPay={() => setStep("enterPin")}
                amount={parseFloat(amount) || 0}
                paymentAmount={quote ? `${quote.totalDebit.toLocaleString()} ${selectedPaymentMethod.currencyCode || ""}` : "Calculating..."}
                paymentMethod={`Crypto (${selectedPaymentMethod.name})`}
                biller={`Wallet (${selectedNetwork})`}
                meterNumber={address}
                customerName="External Wallet"
                meterType="Crypto Transfer"
                serviceAddress=""
                cashback={getCashback()}
                availableBalance={selectedPaymentMethod.balance || "0.00"}
            />
        );
    }

    if (step === "enterPin") {
        return (
            <EnterPin
                onBack={() => setStep("confirmation")}
                onComplete={handlePinComplete}
            />
        );
    }

    if (step === "result" && selectedPaymentMethod) {
        const paymentAmount = quote ? `${quote.totalDebit.toLocaleString()} ${selectedPaymentMethod.currencyCode || ""}` : "0";
        const amountNum = parseFloat(amount) || 0;
        const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;
        const transactionDate = getTransactionDate();

        if (transactionResult === "success") {
            return (
                <PaymentSuccess
                    amount={paymentAmount}
                    amountEquivalent={amountEquivalent}
                    token={transactionToken}
                    biller={`Wallet (${selectedNetwork})`}
                    meterNumber={address}
                    customerName="External Wallet"
                    meterType="Crypto Transfer"
                    serviceAddress=""
                    paymentMethod={selectedPaymentMethod.name}
                    bonusEarned={`₦${getCashback().toFixed(2)} Cashback`}
                    transactionDate={transactionDate}
                    onAddToBeneficiary={() => { }}
                    onContinue={handleContinueFromResult}
                />
            );
        } else {
            return (
                <PaymentFailure
                    amount={paymentAmount}
                    amountEquivalent={amountEquivalent}
                    failureReason="Transaction failed"
                    biller={`Wallet (${selectedNetwork})`}
                    meterNumber={address}
                    customerName="External Wallet"
                    meterType="Crypto Transfer"
                    serviceAddress=""
                    paymentMethod={selectedPaymentMethod.name}
                    transactionDate={transactionDate}
                    onContinue={handleContinueFromResult}
                />
            );
        }
    }

    if (step === "amount") {
        return (
            <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
                <header className="relative flex items-center justify-center px-4 py-6">
                    <button
                        onClick={() => setStep("wallet")}
                        className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                    >
                        <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Enter Amount</h1>
                </header>

                <div className="flex flex-col gap-6 px-4">
                    {/* Recipient Display */}
                    <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col gap-1">
                        <span className="text-gray-400 text-xs">Sending to:</span>
                        <span className="text-white font-mono text-sm break-all">{address}</span>
                        <span className="text-blue-400 text-xs">{selectedNetwork} Network</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-white text-sm font-medium">Amount:</label>
                        <div className="text-4xl font-bold text-white">
                            ₦{amount ? parseFloat(amount).toLocaleString() : "0"}.00
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {amountOptions.map((option) => (
                            <button
                                key={option.amount}
                                onClick={() => setAmount(option.amount.toString())}
                                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${amount === option.amount.toString() ? "ring-2 ring-blue-500" : ""}`}
                            >
                                <span className="text-white font-bold">₦{option.amount.toLocaleString()}</span>
                                <span className="text-gray-400 text-xs">₦{option.cashback} Cashback</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setStep("payment")}
                        disabled={!amount}
                        className="w-full py-4 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        Continue
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
            <header className="relative flex items-center justify-center px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-2xl font-bold text-white">Send to Wallet</h1>
            </header>

            <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Recipient Wallet Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter address"
                        className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-sm font-mono"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Select Network</label>
                    <div className="grid grid-cols-2 gap-3">
                        {networks.map((net) => (
                            <button
                                key={net.id}
                                onClick={() => setSelectedNetwork(net.id)}
                                className={`flex items-center gap-3 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 transition-all ${selectedNetwork === net.id ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                    {net.icon}
                                </div>
                                <span className="text-white text-sm font-medium">{net.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setStep("amount")}
                    disabled={!address || address.length < 20}
                    className="w-full py-4 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
