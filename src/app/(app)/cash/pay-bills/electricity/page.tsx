"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiChevronDown, HiCheckCircle } from "react-icons/hi2";
import PaymentMethod, {
    PaymentOption,
} from "@/components/payment/PaymentMethod";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCashbackBalance } from "@/services/cashback";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
    getElectricityQuote,
    ElectricityQuotePayload,
    executeBillPayment,
    verifyElectricity
} from "@/services/bills";

interface ElectricityProvider {
    id: string;
    name: string;
    logo: string;
    serviceId: string;
}

const electricityProviders: ElectricityProvider[] = [
    { id: "ikeja", name: "Ikeja Electricity", logo: "IE", serviceId: "IKEDC" },
    { id: "ibadan", name: "Ibadan Electricity", logo: "IB", serviceId: "IBEDC" },
    { id: "ph", name: "Port Harcourt Electricity", logo: "PH", serviceId: "PHED" },
    { id: "kano", name: "Kano Electricity", logo: "KN", serviceId: "KEDCO" },
    { id: "abuja", name: "Abuja Electricity", logo: "AE", serviceId: "AEDC" },
];

const amountOptions = [
    { amount: 1000, cashback: 10 },
    { amount: 2000, cashback: 20 },
    { amount: 3000, cashback: 30 },
    { amount: 5000, cashback: 50 },
    { amount: 10000, cashback: 100 },
    { amount: 20000, cashback: 200 },
];

type Step = "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

export default function ElectricityPage() {
    const router = useRouter();
    const { ngnCurrencyId, isLoading: currencyLoading } = useCurrency();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState<Step>("form");
    const [selectedProvider, setSelectedProvider] = useState<ElectricityProvider>(
        electricityProviders[0]
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [paymentType, setPaymentType] = useState<"prepaid" | "postpaid">(
        "prepaid"
    );
    const [meterNumber, setMeterNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentOption | null>(null);
    const [debouncedMeterNumber, setDebouncedMeterNumber] = useState(meterNumber);

    const [quoteReference, setQuoteReference] = useState("");
    const [quoteData, setQuoteData] = useState<any>(null);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [transactionToken, setTransactionToken] = useState("");
    const [failureReason, setFailureReason] = useState("");
    const [transactionResult, setTransactionResult] = useState<TransactionResult>(null);

    // Fetch Bolt Balance (Cashback)
    const { data: cashbackData } = useQuery({
        queryKey: ["cashbackBalance", ngnCurrencyId],
        queryFn: () => getCashbackBalance(ngnCurrencyId!),
        enabled: ngnCurrencyId !== null && !currencyLoading,
    });

    const boltBalance = cashbackData?.data?.availableBolts || 0;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedMeterNumber(meterNumber), 1000);
        return () => clearTimeout(timer);
    }, [meterNumber]);

    const { data: verificationResponse, isFetching: isVerifying, error: verificationErrorObj } = useQuery({
        queryKey: ['verifyElectricity', selectedProvider?.serviceId, debouncedMeterNumber, paymentType],
        queryFn: () => verifyElectricity({ serviceId: selectedProvider.serviceId, billersCode: debouncedMeterNumber, type: paymentType }),
        enabled: !!debouncedMeterNumber && debouncedMeterNumber.length >= 11 && !!selectedProvider,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const isDebouncing = meterNumber !== debouncedMeterNumber;
    const verificationData = verificationResponse?.data;
    const meterVerified = !isDebouncing && !isVerifying && verificationResponse?.success && verificationData?.verified;
    const customerName = meterVerified ? verificationData?.name || "" : "";

    const verificationError = useMemo(() => {
        if (isDebouncing || isVerifying) return "";
        if (verificationErrorObj) return (verificationErrorObj as any).message || "Verification failed";
        if (verificationResponse && !verificationResponse.success) return verificationResponse.description || "Verification failed";
        if (verificationResponse?.success && !verificationData?.verified) return verificationData?.error || "Verification failed";
        return "";
    }, [isDebouncing, isVerifying, verificationErrorObj, verificationResponse, verificationData]);

    const quoteMutation = useMutation({
        mutationFn: (payload: ElectricityQuotePayload) => getElectricityQuote(payload),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setQuoteReference(response.data.quoteReference);
                setQuoteData(response.data);
                setStep("confirmation");
            } else {
                throw new Error(response.description || "Failed to get quote");
            }
        },
        onError: (error: any) => {
            let reason = "Failed to get quote";
            if (typeof error === "string") reason = error;
            else if (typeof error === "object") reason = error.description || error.message || reason;
            setFailureReason(reason);
            setTransactionResult("failure");
            setStep("result");
        }
    });

    const paymentMutation = useMutation({
        mutationFn: (data: { quoteReference: string, pin: string }) => executeBillPayment(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setTransactionToken(response.data?.transactionReference || response.data?.quoteReference || "");
                setTransactionDetails(response.data);
                setTransactionResult("success");
                setStep("result");
            } else {
                throw new Error(response.description || "Payment failed");
            }
        },
        onError: (error: any) => {
            let reason = "An unexpected error occurred";
            if (typeof error === "string") reason = error;
            else if (typeof error === "object") reason = error.description || error.message || reason;
            setFailureReason(reason);
            setTransactionResult("failure");
            setStep("result");
        }
    });

    const isProcessing = quoteMutation.isPending || paymentMutation.isPending;

    const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
        setSelectedPaymentMethod(paymentMethod);
        quoteMutation.mutate({
            serviceId: selectedProvider.serviceId,
            billersCode: meterNumber,
            type: paymentType,
            purchaseAmount: parseFloat(amount),
            phone: phone,
            sourceCurrencyTicker: paymentMethod.currencyCode || "ngn",
            walletId: paymentMethod.walletId || 100,
            baseCostCurrency: "ngn"
        });
    };

    const calculatePaymentAmount = (): string => {
        if (!selectedPaymentMethod || !amount) return "0";
        if (quoteData) return `${quoteData.deductionAmount.toFixed(6)} ${quoteData.deductionCurrency.toUpperCase()}`;
        return `₦${parseFloat(amount).toLocaleString()}.00`;
    };

    const getTransactionDate = (): string => {
        const now = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[now.getMonth()];
        const displayHours = now.getHours() % 12 || 12;
        return `${month} ${now.getDate()}, ${now.getFullYear()} ${displayHours}:${now.getMinutes().toString().padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
    };

    const handleContinue = () => {
        setStep("form");
        setTransactionResult(null);
        setTransactionToken("");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
        };
        if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    if (step === "payment") return <PaymentMethod onBack={() => setStep("form")} onSelect={handlePaymentMethodSelect} amount={parseFloat(amount) || 0} walletType="fiat" />;

    if (step === "confirmation" && selectedPaymentMethod) {
        return <Confirmation onBack={() => setStep("payment")} onPay={() => setStep("enterPin")} amount={parseFloat(amount) || 0} paymentAmount={calculatePaymentAmount()} availableBalance={selectedPaymentMethod.balance || selectedPaymentMethod.value} boltBalance={boltBalance} details={[{ label: "Provider", value: selectedProvider.name }, { label: "Meter Number", value: meterNumber }, { label: "Customer Name", value: customerName || "N/A" }, { label: "Meter Type", value: paymentType === "prepaid" ? "Prepaid" : "Postpaid" }, { label: "Amount", value: `₦${parseFloat(amount).toLocaleString()}.00` }, { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` }]} />;
    }

    if (step === "enterPin") return <EnterPin onBack={() => setStep("confirmation")} onComplete={(pin) => paymentMutation.mutate({ quoteReference, pin })} isLoading={isProcessing} />;

    if (step === "result" && selectedPaymentMethod) {
        const paymentAmount = calculatePaymentAmount();
        const commonDetails = [{ label: "Provider", value: selectedProvider.name }, { label: "Meter Number", value: meterNumber }, { label: "Customer Name", value: transactionDetails?.metadata?.customerName || customerName || "N/A" }, { label: "Meter Type", value: paymentType === "prepaid" ? "Prepaid" : "Postpaid" }, { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` }];
        if (transactionResult === "success") {
            let tokenDisplay = transactionDetails?.metadata?.token || "";
            if (tokenDisplay.toLowerCase().startsWith("token : ")) tokenDisplay = tokenDisplay.substring(8);
            else if (tokenDisplay.toLowerCase().startsWith("token: ")) tokenDisplay = tokenDisplay.substring(7);
            if (!tokenDisplay) tokenDisplay = transactionToken;
            const successDetails = [...commonDetails, { label: "Token", value: tokenDisplay }, { label: "Units Purchased", value: transactionDetails?.metadata?.unit || "N/A" }, { label: "Transaction Date", value: getTransactionDate() }];
            return <PaymentSuccess title="Electricity Purchase Successful" amount={paymentAmount} amountEquivalent={`≈ ₦${parseFloat(amount).toLocaleString()}.00`} details={successDetails} onAddToBeneficiary={() => { }} onContinue={handleContinue} />;
        } else {
            const failureDetails = [{ label: "Failure Reason", value: failureReason || "Service provider down" }, ...commonDetails, { label: "Transaction Date", value: getTransactionDate() }];
            return <PaymentFailure title="Electricity Purchase Failed" amount={paymentAmount} amountEquivalent={`≈ ₦${parseFloat(amount).toLocaleString()}.00`} details={failureDetails} onContinue={handleContinue} />;
        }
    }

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
            <header className="relative flex items-center justify-center px-4 py-6">
                <button onClick={() => router.back()} className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"><MdOutlineKeyboardDoubleArrowLeft className="text-white" /></button>
                <h1 className="text-2xl font-bold text-white">Electricity</h1>
            </header>
            <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Service Provider</label>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">{selectedProvider.logo}</span></div>
                                <span className="text-white font-medium">{selectedProvider.name}</span>
                            </div>
                            {isDropdownOpen ? <HiChevronDown className="w-5 h-5 text-white" /> : <HiChevronRight className="w-5 h-5 text-white" />}
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                                {electricityProviders.map((provider) => (
                                    <button key={provider.id} onClick={() => { setSelectedProvider(provider); setIsDropdownOpen(false); }} className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">{provider.logo}</span></div>
                                        <span className="text-white font-medium">{provider.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
                        <button onClick={() => setPaymentType("prepaid")} className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentType === "prepaid" ? "bg-gray-700 text-white" : "text-white/70 hover:text-white"}`}>Prepaid</button>
                        <div className="w-px bg-white/20"></div>
                        <button onClick={() => setPaymentType("postpaid")} className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentType === "postpaid" ? "bg-gray-700 text-white" : "text-white/70 hover:text-white"}`}>Postpaid</button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Meter Number</label>
                    <input type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} placeholder="e.g 00000000000" className={`w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border ${verificationError ? "border-red-500" : "border-white/20"} text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm`} />
                    {verificationError && <p className="text-red-500 text-xs px-1">{verificationError}</p>}
                    <div className="flex justify-end"><button className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors">See Beneficiaries <HiChevronRight className="w-4 h-4" /></button></div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g 08011111111" className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                </div>
                {meterVerified && customerName && <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0"><span className="text-white text-lg font-bold">{customerName.charAt(0)}</span></div><div className="flex flex-col"><span className="text-white font-medium">{customerName}</span><span className="text-gray-400 text-sm">{meterNumber}</span></div></div><HiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /></div>}
                <div className="flex flex-col gap-2">
                    <label className="text-white text-sm font-medium">Select Amount</label>
                    <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="enter amount" className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm mb-2" />
                    <div className="grid grid-cols-3 gap-3">
                        {amountOptions.map((option) => (
                            <button key={option.amount} onClick={() => setAmount(option.amount.toString())} className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${amount === option.amount.toString() ? "ring-2 ring-blue-500 border-blue-500" : ""}`}><span className="text-white font-bold text-base">₦{option.amount.toLocaleString()}</span></button>
                        ))}
                    </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); if (meterNumber && amount && phone && meterVerified) setStep("payment"); }} disabled={!meterNumber || !amount || !phone || !meterVerified} className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!meterNumber || !amount || !phone || !meterVerified ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed" : ""}`}>Pay</button>
            </div>
        </div>
    );
}
