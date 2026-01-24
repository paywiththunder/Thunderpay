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
  serviceId: string; // API service ID
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

  // State that might still be needed if not fully derived from mutations (transitioning between steps)
  const [quoteReference, setQuoteReference] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [transactionToken, setTransactionToken] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [transactionResult, setTransactionResult] = useState<TransactionResult>(null);

  // Debounce meter number
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMeterNumber(meterNumber);
    }, 1000);
    return () => clearTimeout(timer);
  }, [meterNumber]);

  // Query for Meter Verification
  const {
    data: verificationResponse,
    isFetching: isVerifying,
    error: verificationErrorObj
  } = useQuery({
    queryKey: ['verifyElectricity', selectedProvider?.serviceId, debouncedMeterNumber, paymentType],
    queryFn: () => verifyElectricity({
      serviceId: selectedProvider.serviceId,
      billersCode: debouncedMeterNumber,
      type: paymentType
    }),
    enabled: !!debouncedMeterNumber && debouncedMeterNumber.length >= 11 && !!selectedProvider,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Derived Verification State
  const isDebouncing = meterNumber !== debouncedMeterNumber;
  const verificationData = verificationResponse?.data;
  const meterVerified = !isDebouncing && !isVerifying && verificationResponse?.success && verificationData?.verified;
  const customerName = meterVerified ? verificationData?.name || "" : "";

  // Error handling for verification
  const verificationError = useMemo(() => {
    if (isDebouncing || isVerifying) return "";
    if (verificationErrorObj) return (verificationErrorObj as any).message || "Verification failed";
    if (verificationResponse && !verificationResponse.success) return verificationResponse.description || "Verification failed";
    if (verificationResponse?.success && !verificationData?.verified) return verificationData?.error || "Verification failed";
    return "";
  }, [isDebouncing, isVerifying, verificationErrorObj, verificationResponse, verificationData]);


  // Mutation for Getting Quote
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
      console.error("Quote Error:", error);
      let reason = "Failed to get quote";
      if (typeof error === "string") reason = error;
      else if (typeof error === "object") reason = error.description || error.message || reason;

      setFailureReason(reason);
      setTransactionResult("failure");
      setStep("result");
    }
  });

  // Mutation for Executing Payment
  const paymentMutation = useMutation({
    mutationFn: (data: { quoteReference: string, pin: string }) => executeBillPayment(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setTransactionToken(response.data.transactionReference);
        setTransactionDetails(response.data);
        setTransactionResult("success");
        setStep("result");
      } else {
        throw new Error(response.description || "Payment failed");
      }
    },
    onError: (error: any) => {
      console.error("Payment Error:", error);
      let reason = "An unexpected error occurred";
      if (typeof error === "string") reason = error;
      else if (typeof error === "object") reason = error.description || error.message || reason;

      setFailureReason(reason);
      setTransactionResult("failure");
      setStep("result");
    }
  });

  const isProcessing = quoteMutation.isPending || paymentMutation.isPending;



  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (meterNumber && amount && phone) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);

    // Fetch quote before proceeding to confirmation
    const payload: ElectricityQuotePayload = {
      serviceId: selectedProvider.serviceId,
      billersCode: meterNumber,
      type: paymentType,
      purchaseAmount: parseFloat(amount),
      phone: phone,
      sourceCurrencyTicker: paymentMethod.currencyCode || "ngn",
      walletId: paymentMethod.walletId || 100,
      baseCostCurrency: "ngn"
    };

    quoteMutation.mutate(payload);
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod || !amount) return "0";
    const amountNum = parseFloat(amount);

    // Use quote data if available
    if (quoteData) {
      return `${quoteData.deductionAmount.toFixed(6)} ${quoteData.deductionCurrency.toUpperCase()}`;
    }

    if (selectedPaymentMethod.type === "fiat") {
      return `₦${amountNum.toLocaleString()}.00`;
    }

    // Fallback mock conversion rates for crypto
    const rates: { [key: string]: number } = {
      usdt: 1.0, // 1 USDT = $1
      bitcoin: 0.000023, // Approximate rate
      ethereum: 0.00042, // Approximate rate
      solana: 0.006, // Approximate rate
    };

    const rate = rates[selectedPaymentMethod.id] || 1;
    const cryptoAmount = amountNum / (rate * 1500); // Assuming 1 USD = 1500 NGN

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
    // Generate a random token in format: XXXX-XXXX-XXXX-XXXX-XXXX
    const segments = Array.from({ length: 5 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString()
    );
    return segments.join("-");
  };

  const getTransactionDate = (): string => {
    const now = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
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

  const handlePinComplete = (pin: string) => {
    // Execute bill payment with quote reference
    paymentMutation.mutate({
      quoteReference: quoteReference,
      pin: pin
    });
  };

  const handleAddToBeneficiary = () => {
    // Handle adding to beneficiary
    console.log("Add to beneficiary");
  };

  const handleContinue = () => {
    // Reset and go back to form
    setStep("form");
    setTransactionResult(null);
    setTransactionToken("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Render Payment Method step
  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("form")}
        onSelect={handlePaymentMethodSelect}
        amount={parseFloat(amount) || 0}
      />
    );
  }

  // Render Confirmation step
  if (step === "confirmation" && selectedPaymentMethod) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={parseFloat(amount) || 0}
        paymentAmount={calculatePaymentAmount()}
        details={[
          { label: "Provider", value: selectedProvider.name },
          { label: "Meter Number", value: meterNumber },
          { label: "Customer Name", value: customerName || "N/A" },
          { label: "Meter Type", value: paymentType === "prepaid" ? "Prepaid" : "Postpaid" },
          { label: "Amount", value: `₦${parseFloat(amount).toLocaleString()}.00` },
          { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` },
          { label: "Bonus to Earn", value: `₦${getCashback().toFixed(2)} Cashback` },
        ]}
        availableBalance={getAvailableBalance()}
      />
    );
  }

  // Render Enter Pin step
  if (step === "enterPin") {
    return (
      <EnterPin
        onBack={() => setStep("confirmation")}
        onComplete={handlePinComplete}
        isLoading={isProcessing}
      />
    );
  }

  // Render Result step (Success or Failure)
  if (step === "result" && selectedPaymentMethod) {
    const paymentAmount = calculatePaymentAmount();
    const amountNum = parseFloat(amount) || 0;
    const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;

    const commonDetails = [
      { label: "Provider", value: selectedProvider.name },
      { label: "Meter Number", value: meterNumber },
      { label: "Customer Name", value: transactionDetails?.metadata?.customerName || customerName || "N/A" },
      { label: "Meter Type", value: paymentType === "prepaid" ? "Prepaid" : "Postpaid" },
      { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` },
    ];

    if (transactionResult === "success") {
      const metadata = transactionDetails?.metadata || {};

      // Parse token if needed (remove "Token : " prefix)
      let tokenDisplay = metadata.token || "";
      if (tokenDisplay.toLowerCase().startsWith("token : ")) {
        tokenDisplay = tokenDisplay.substring(8);
      } else if (tokenDisplay.toLowerCase().startsWith("token: ")) {
        tokenDisplay = tokenDisplay.substring(7);
      }
      // Fallback to transactionToken if metadata token is missing
      if (!tokenDisplay) tokenDisplay = transactionToken;

      const successDetails = [
        ...commonDetails,
        { label: "Token", value: tokenDisplay },
        { label: "Units Purchased", value: metadata.unit || "N/A" },
        { label: "Bonus Earned", value: `₦${getCashback().toFixed(2)} Cashback` },
        { label: "Transaction Date", value: getTransactionDate() },
      ];

      // Add address only if real data exists
      if (metadata.customerAddress) {
        successDetails.splice(3, 0, { label: "Service Address", value: metadata.customerAddress });
      }

      return (
        <PaymentSuccess
          title="Electricity Purchase Successful"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          details={successDetails}
          onAddToBeneficiary={handleAddToBeneficiary}
          onContinue={handleContinue}
        />
      );
    } else if (transactionResult === "failure") {
      const failureDetails = [
        { label: "Failure Reason", value: failureReason || "Service provider down" },
        ...commonDetails,
        { label: "Transaction Date", value: getTransactionDate() }
      ];

      return (
        <PaymentFailure
          title="Electricity Purchase Failed"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          details={failureDetails}
          onContinue={handleContinue}
        />
      );
    }
  }

  // Render Form step
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Electricity</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Service Provider Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Service Provider
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedProvider.logo}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {selectedProvider.name}
                </span>
              </div>
              {isDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {electricityProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
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

        {/* Payment Type Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setPaymentType("prepaid")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentType === "prepaid"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Prepaid
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setPaymentType("postpaid")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentType === "postpaid"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Postpaid
            </button>
          </div>
        </div>

        {/* Meter Number Input */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Meter Number</label>
          <input
            type="text"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value)}
            placeholder="e.g 00000000000"
            className={`w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border ${verificationError ? "border-red-500" : "border-white/20"} text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm`}
          />
          {meterNumber.length > 0 && meterNumber.length < 11 && (
            <p className="text-yellow-500 text-xs px-1">Complete meter number</p>
          )}
          {verificationError && (
            <p className="text-red-500 text-xs px-1">{verificationError}</p>
          )}
          <div className="flex justify-end">
            <button className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors">
              See Beneficiaries
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g 08011111111"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Meter Verification Card */}
        {meterVerified && customerName && (
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {customerName.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium">{customerName}</span>
                <span className="text-gray-400 text-sm">{meterNumber}</span>
              </div>
            </div>
            <HiCheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          </div>
        )}

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
          disabled={!meterNumber || !amount || !phone || !meterVerified}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!meterNumber || !amount || !phone || !meterVerified
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
