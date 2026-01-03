"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { getAirtimeQuote, AirtimeQuoteResponse, executeBillPayment, BillExecutionResponse } from "@/services/bills";

interface NetworkProvider {
  id: string;
  name: string;
  logo: string;
}

interface RecentNumber {
  id: string;
  number: string;
  network: string;
}

const networkProviders: NetworkProvider[] = [
  { id: "mtn", name: "MTN", logo: "M" },
  { id: "airtel", name: "Airtel", logo: "A" },
  { id: "glo", name: "GLO", logo: "G" },
  { id: "9mobile", name: "9mobile", logo: "9" },
  { id: "glo_sme", name: "GLO SME", logo: "G" },
  { id: "etisalat", name: "ETISALAT", logo: "E" },
  { id: "foreign_airtime", name: "FOREIGN AIRTIME", logo: "F" },
  { id: "smile", name: "SMILE", logo: "S" },
  { id: "spectranet", name: "SPECTRANET", logo: "S" },
];

const amountOptions = [
  { amount: 1000, cashback: 10 },
  { amount: 2000, cashback: 20 },
  { amount: 3000, cashback: 30 },
  { amount: 5000, cashback: 50 },
  { amount: 10000, cashback: 100 },
  { amount: 20000, cashback: 200 },
];

const recentNumbers: RecentNumber[] = [
  { id: "1", number: "09020933533", network: "MTN" },
  { id: "2", number: "09024853533", network: "Airtel" },
];

type Step = "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

export default function AirtimePage() {
  const router = useRouter();
  const networkDropdownRef = useRef<HTMLDivElement>(null);
  const recentsDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>(
    networkProviders[0]
  );
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isRecentsDropdownOpen, setIsRecentsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [failureReason, setFailureReason] = useState("");
  const [transactionToken, setTransactionToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [quote, setQuote] = useState<AirtimeQuoteResponse | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  // Mock phone verification
  useEffect(() => {
    if (phoneNumber.length >= 10) {
      const timer = setTimeout(() => {
        setPhoneVerified(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPhoneVerified(false);
    }
  }, [phoneNumber]);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleRecentSelect = (recent: RecentNumber) => {
    setPhoneNumber(recent.number);
    const network = networkProviders.find((n) =>
      n.name.toLowerCase() === recent.network.toLowerCase()
    );
    if (network) {
      setSelectedNetwork(network);
    }
    setIsRecentsDropdownOpen(false);
    setPhoneVerified(true);
  };

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (phoneNumber && amount) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = async (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setQuoteError("");
    setQuote(null);

    // If it's fiat, we might strictly not need a quote or maybe we do for fees? 
    // Assuming we do for consistency or specifically when it's crypto.
    // The user example had "sourceCurrencyTicker": "trx", implying crypto.

    if (paymentMethod.currencyCode) {
      setIsQuoteLoading(true);
      try {
        const payload = {
          phone: phoneNumber,
          purchaseAmount: parseFloat(amount),
          sourceCurrencyTicker: paymentMethod.currencyCode.toLowerCase(),
          walletId: paymentMethod.id, // ID from the wallet list
          baseCostCurrency: "ngn", // Assuming base is NGN for airtime
          serviceId: selectedNetwork.id.toUpperCase() // e.g., MTN
        };

        console.log("Fetching quote with:", payload);
        const response = await getAirtimeQuote(payload);
        const quoteData = response.data || response;
        setQuote(quoteData);
        localStorage.setItem("currentAirtimeQuote", JSON.stringify(quoteData));
        setStep("confirmation");
      } catch (err: any) {
        console.error(err);
        setQuoteError(err?.description || "Failed to get quote");
        // Optionally still go to confirmation but show error, or stay on payment?
        // For now, let's stay and show error (alert or simple log)
        alert(err?.description || "Failed to get quote");
      } finally {
        setIsQuoteLoading(false);
      }
    } else {
      // Fallback for fiat or if no currency code (legacy hardcoded items)
      setStep("confirmation");
    }
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod || !amount) return "0";
    const amountNum = parseFloat(amount);

    if (quote) {
      return `${quote.deductionAmount.toFixed(6)} ${quote.deductionCurrency.toUpperCase()}`;
    }

    if (selectedPaymentMethod.type === "fiat") {
      return `₦${amountNum.toLocaleString()}.00`;
    }

    const rates: { [key: string]: number } = {
      usdt: 1.0,
      bitcoin: 0.000023,
      ethereum: 0.00042,
      solana: 0.006,
    };

    const rate = rates[selectedPaymentMethod.id] || 1;
    const cryptoAmount = amountNum / (rate * 1500);

    if (selectedPaymentMethod.currencyCode) {
      return `${cryptoAmount.toFixed(6)} ${selectedPaymentMethod.currencyCode}`;
    }

    if (selectedPaymentMethod.id === "usdt") {
      return `${cryptoAmount.toFixed(4)} USDT`;
    } else if (selectedPaymentMethod.id === "bitcoin") {
      return `${cryptoAmount.toFixed(8)} BTC`;
    } else if (selectedPaymentMethod.id === "ethereum") {
      return `${cryptoAmount.toFixed(6)} ETH`;
    } else if (selectedPaymentMethod.id === "solana") {
      return `${cryptoAmount.toFixed(4)} SOL`;
    }

    return `₦${amountNum.toLocaleString()}.00`;
  };

  const getCashback = (): number => {
    const amountNum = parseFloat(amount);
    const option = amountOptions.find((opt) => opt.amount === amountNum);
    return option?.cashback || 0;
  };

  const getAvailableBalance = (): string => {
    if (!selectedPaymentMethod) return "₦0.00";
    if (selectedPaymentMethod.balance) return selectedPaymentMethod.balance;
    return selectedPaymentMethod.value;
  };

  const generateTransactionToken = (): string => {
    const segments = Array.from({ length: 5 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString()
    );
    return segments.join("-");
  };

  const getTransactionDate = (): string => {
    const now = new Date();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${month} ${day}, Oct ${displayHours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const handlePinComplete = async (pin: string) => {
    setIsProcessing(true);
    try {
      // Retrieve quote from state first, fallback to localStorage if needed
      let currentQuote = quote;
      if (!currentQuote) {
        const stored = localStorage.getItem("currentAirtimeQuote");
        if (stored) {
          currentQuote = JSON.parse(stored);
        }
      }

      if (!currentQuote?.quoteReference) {
        throw new Error("No valid quote found. Please try again.");
      }

      const payload = {
        quoteReference: currentQuote.quoteReference,
        pin: parseInt(pin, 10)
      };

      const response = (await executeBillPayment(payload)) as BillExecutionResponse;

      if (response.success && response.data) {
        setTransactionToken(response.data.transactionReference);
        setTransactionDetails(response.data);
        setTransactionResult("success");
        setStep("result");
      } else {
        setFailureReason(response.description || "Payment failed");
        setTransactionResult("failure");
        setStep("result");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      let reason = "An unexpected error occurred";

      if (typeof error === "string") {
        reason = error;
      } else if (typeof error === "object") {
        reason = error.description || error.message || reason;
      }

      setFailureReason(reason);
      setTransactionResult("failure");
      setStep("result");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToBeneficiary = () => {
    console.log("Add to beneficiary");
  };

  const handleContinue = () => {
    setStep("form");
    setTransactionResult(null);
    setTransactionToken("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNetworkDropdownOpen(false);
      }
      if (
        recentsDropdownRef.current &&
        !recentsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRecentsDropdownOpen(false);
      }
    };

    if (isNetworkDropdownOpen || isRecentsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNetworkDropdownOpen, isRecentsDropdownOpen]);

  if (step === "payment") {
    return (
      <>
        {isQuoteLoading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#161616] p-4 rounded-xl border border-white/10 flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white text-sm">Getting Quote...</span>
            </div>
          </div>
        )}
        <PaymentMethod
          onBack={() => setStep("form")}
          onSelect={handlePaymentMethodSelect}
          amount={parseFloat(amount) || 0}
        />
      </>
    );
  }

  if (step === "confirmation" && selectedPaymentMethod) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={parseFloat(amount) || 0}
        paymentAmount={calculatePaymentAmount()}
        details={[
          { label: "Network", value: selectedNetwork.name },
          { label: "Phone Number", value: phoneNumber },
          { label: "Amount", value: `₦${parseFloat(amount).toLocaleString()}.00` },
          { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` },
          { label: "Bonus to Earn", value: `₦${getCashback().toFixed(2)} Cashback` },
        ]}
        availableBalance={getAvailableBalance()}
      />
    );
  }

  if (step === "enterPin") {
    return (
      <EnterPin
        onBack={() => setStep("confirmation")}
        onComplete={handlePinComplete}
        isLoading={isProcessing}
      />
    );
  }

  if (step === "result" && selectedPaymentMethod) {
    const paymentAmount = calculatePaymentAmount();
    const amountNum = parseFloat(amount) || 0;
    const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;

    if (transactionResult === "success") {
      const metadata = transactionDetails?.metadata || {};

      return (
        <PaymentSuccess
          title="Airtime Purchase Successful"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedNetwork.name}
          billerLabel="Network"
          meterNumber={phoneNumber}
          meterNumberLabel="Phone Number"
          customerName={metadata.customerName || phoneNumber}
          customerNameLabel="Recipient"
          meterType={`₦${parseFloat(amount).toLocaleString()}.00`}
          meterTypeLabel="Amount"
          serviceAddress={metadata.customerAddress || ""}
          paymentMethod={
            selectedPaymentMethod.type === "fiat"
              ? "Fiat"
              : selectedPaymentMethod.name
          }
          bonusEarned={`₦${getCashback().toFixed(2)} Cashback`}
          transactionDate={getTransactionDate()}
          onAddToBeneficiary={handleAddToBeneficiary}
          onContinue={handleContinue}
        />
      );
    } else if (transactionResult === "failure") {
      return (
        <PaymentFailure
          title="Airtime Purchase Failed"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          failureReason={failureReason || "Service provider down"}
          biller={selectedNetwork.name}
          meterNumber={phoneNumber}
          customerName={phoneNumber}
          meterType="Airtime"
          serviceAddress=""
          paymentMethod={
            selectedPaymentMethod.type === "fiat"
              ? "Fiat"
              : selectedPaymentMethod.name
          }
          transactionDate={getTransactionDate()}
          onContinue={handleContinue}
        />
      );
    }
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
        <h1 className="text-2xl font-bold text-white">Airtime</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Select Network Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Network
          </label>
          <div className="relative" ref={networkDropdownRef}>
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedNetwork.logo}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {selectedNetwork.name}
                </span>
              </div>
              {isNetworkDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isNetworkDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {networkProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedNetwork(provider);
                      setIsNetworkDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {provider.logo}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {provider.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phone Number Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Phone Number</label>
          <div className="relative" ref={recentsDropdownRef}>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g 00000000000"
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
            {phoneVerified && phoneNumber && (
              <div className="mt-2 bg-blue-500 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{phoneNumber}</span>
                  <span className="text-white/80 text-sm">{selectedNetwork.name}</span>
                </div>
                <HiCheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setIsRecentsDropdownOpen(!isRecentsDropdownOpen)}
                className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors"
              >
                See Recents
                {isRecentsDropdownOpen ? (
                  <HiChevronDown className="w-4 h-4" />
                ) : (
                  <HiChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
            {isRecentsDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10">
                {recentNumbers.map((recent) => (
                  <button
                    key={recent.id}
                    onClick={() => handleRecentSelect(recent)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">{recent.number}</span>
                    <span className="text-gray-400 text-sm">{recent.network}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Select Amount Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Select Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="enter amount"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm mb-2"
          />

          {/* Amount Buttons Grid */}
          <div className="grid grid-cols-3 gap-3">
            {amountOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => handleAmountSelect(option.amount)}
                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${amount === option.amount.toString()
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : ""
                  }`}
              >
                <span className="text-white font-bold text-base">
                  ₦{option.amount.toLocaleString()}
                </span>
                <span className="text-gray-400 text-xs mt-1">
                  ₦{option.cashback} Cashback
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!phoneNumber || !amount || !phoneVerified}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!phoneNumber || !amount || !phoneVerified
            ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
            : ""
            }`}
        >
          Pay
        </button>
      </div>
    </div>
  );
}
