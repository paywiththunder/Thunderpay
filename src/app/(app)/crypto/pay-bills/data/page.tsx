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
import { getAirtimeQuote, AirtimeQuoteResponse, executeBillPayment, BillExecutionResponse, getDataPlans, DataPlan as ApiDataPlan, getDataQuote, DataQuotePayload, BillExecutionPayload } from "@/services/bills";
import { useQuery, useMutation } from "@tanstack/react-query";

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

interface DataPlan {
  id: string;
  data: string;
  price: number;
  duration: string;
  cashback: number;
}

const networkProviders: NetworkProvider[] = [
  { id: "mtn", name: "MTN", logo: "M" },
  { id: "airtel", name: "Airtel", logo: "A" },
  { id: "glo", name: "GLO", logo: "G" },
  { id: "9mobile", name: "9mobile", logo: "9" },
];

const FALLBACK_PLANS: DataPlan[] = [
  { id: "1gb", data: "1GB", price: 500, duration: "1 Day", cashback: 5 },
  { id: "2.5gb", data: "2.5GB", price: 700, duration: "2 Days", cashback: 7 },
  { id: "3.2gb", data: "3.2GB", price: 1000, duration: "2 Days", cashback: 10 },
  { id: "2gb", data: "2GB", price: 1500, duration: "30 Days", cashback: 15 },
  { id: "3.5gb", data: "3.5GB", price: 2500, duration: "30 Days", cashback: 25 },
  { id: "20gb", data: "20GB", price: 5000, duration: "30 Days", cashback: 50 },
];

const recentNumbers: RecentNumber[] = [
  { id: "1", number: "09020933533", network: "MTN" },
  { id: "2", number: "09024853533", network: "Airtel" },
];

type Step = "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;
type OfferCategory = "hot-offers" | "daily" | "weekly";

export default function DataPage() {
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
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [offerCategory, setOfferCategory] = useState<OfferCategory>("hot-offers");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [failureReason, setFailureReason] = useState("");
  const [transactionToken, setTransactionToken] = useState("");
  const [pinError, setPinError] = useState("");

  const [availablePlans, setAvailablePlans] = useState<DataPlan[]>(FALLBACK_PLANS);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);

  // Query for Data Plans
  const { isFetching: isPlansLoading } = useQuery({
    queryKey: ['dataPlans', selectedNetwork.id],
    queryFn: () => getDataPlans(selectedNetwork.id),
    select: (data) => {
      if (data.success && data.data) {
        return data.data.map((p: ApiDataPlan) => {
          const nameParts = p.name.split('-');
          const duration = nameParts.length > 1 ? nameParts[1].trim() : "N/A";
          const dataMatch = p.name.match(/(\d+(\.\d+)?(MB|GB))/i);
          const dataAmount = dataMatch ? dataMatch[0] : p.name;

          return {
            id: p.variation_code,
            data: dataAmount,
            price: parseFloat(p.variation_amount),
            duration: duration,
            cashback: 0
          } as DataPlan;
        });
      }
      return FALLBACK_PLANS;
    }
  });

  // Use useEffect to sync query result to state if needed, or derived state directly
  // However, since we have filtering logic on availablePlans, let's just use the query data directly in filtering if possible.
  // But strictly refactoring existing pattern:
  const { data: queryPlans } = useQuery({
    queryKey: ['dataPlans', selectedNetwork.id],
    queryFn: () => getDataPlans(selectedNetwork.id),
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  useEffect(() => {
    if (queryPlans && queryPlans.success && queryPlans.data) {
      const mappedPlans = queryPlans.data.map((p: ApiDataPlan) => {
        const nameParts = p.name.split('-');
        const duration = nameParts.length > 1 ? nameParts[1].trim() : "N/A";
        const dataMatch = p.name.match(/(\d+(\.\d+)?(MB|GB))/i);
        const dataAmount = dataMatch ? dataMatch[0] : p.name;

        return {
          id: p.variation_code,
          data: dataAmount,
          price: parseFloat(p.variation_amount),
          duration: duration,
          cashback: 0
        };
      });
      setAvailablePlans(mappedPlans);
    } else {
      // Keep fallback if error or empty
      // setAvailablePlans(FALLBACK_PLANS); 
    }
  }, [queryPlans]);

  // Mutation for Data Quote
  const quoteMutation = useMutation({
    mutationFn: (payload: DataQuotePayload) => getDataQuote(payload),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const quoteData = response.data;
        localStorage.setItem("currentDataQuote", JSON.stringify(quoteData));
        setQuote(quoteData);
        setStep("confirmation");
      } else {
        setFailureReason(response.description || "Failed to generate quote");
        setTransactionResult("failure");
        setStep("result");
      }
    },
    onError: (error: any) => {
      console.error("Quote Error", error);
      setFailureReason(error?.description || error?.message || "Failed to generate quote");
      setTransactionResult("failure");
      setStep("result");
    }
  });

  // Mutation for Payment Execution
  const paymentMutation = useMutation({
    mutationFn: (payload: BillExecutionPayload) => executeBillPayment(payload),
    onSuccess: (response) => {
      const res = response as BillExecutionResponse;
      if (res.success && res.data) {
        setTransactionToken(res.data.transactionReference);
        setTransactionDetails(res.data);
        setTransactionResult("success");
        setStep("result");
      } else {
        const reason = res.description || "Payment failed";
        if (reason.toLowerCase().includes("pin")) {
          setPinError(reason);
        } else {
          setFailureReason(reason);
          setTransactionResult("failure");
          setStep("result");
        }
      }
    },
    onError: (error: any) => {
      console.error("Payment Error:", error);
      let reason = "An unexpected error occurred";
      if (typeof error === "string") reason = error;
      else if (typeof error === "object") reason = error.description || error.message || reason;

      if (reason.toLowerCase().includes("pin")) {
        setPinError(reason);
      } else {
        setFailureReason(reason);
        setTransactionResult("failure");
        setStep("result");
      }
    }
  });

  const isProcessing = quoteMutation.isPending || paymentMutation.isPending;

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

  const getFilteredPlans = () => {
    if (!availablePlans.length) return [];

    return availablePlans.filter((plan) => {
      const durationLower = plan.duration.toLowerCase();

      switch (offerCategory) {
        case "daily":
          // Matches "24 hrs", "1 day", "2 days"
          // Excludes "30 days" or "7 days" implicitly if we are strict, 
          // but valid logic: anything with 'hr' OR 'day' but NOT '7 days' or '30 days'?
          // Better logic: 
          // 1. Explicitly match "hr" or "hour"
          // 2. Match "day" if the number preceding it is <= 3
          if (durationLower.includes("hr")) return true;
          if (durationLower.includes("day")) {
            // Extract number of days
            const days = parseInt(durationLower) || 1;
            // Logic: If it starts with a number like "2 days", parseInt gets 2.
            // If "1 day", gets 1.
            // If "30 days", gets 30.
            return days <= 3;
          }
          return false;

        case "weekly":
          // Matches "week", "7 days", "14 days"
          if (durationLower.includes("week")) return true;
          if (durationLower.includes("day")) {
            const days = parseInt(durationLower) || 0;
            return days > 3 && days <= 14;
          }
          return false;

        case "hot-offers":
        default:
          // Default bucket (Monthly / 30 days / Others)
          // Or explicitly >= 15 days
          if (durationLower.includes("month")) return true;
          if (durationLower.includes("day")) {
            const days = parseInt(durationLower) || 0;
            return days > 14;
          }
          // If duration is unknown/N/A, maybe put in Hot Offers
          return !durationLower.includes("hr") && !durationLower.includes("week");
      }
    });
  };

  const filteredPlans = getFilteredPlans();

  const handlePlanSelect = (plan: DataPlan) => {
    setSelectedPlan(plan);
  };

  const handleRecentSelect = (recent: RecentNumber) => {
    setPhoneNumber(recent.number);
    const network = networkProviders.find(
      (n) => n.name.toLowerCase() === recent.network.toLowerCase()
    );
    if (network) {
      setSelectedNetwork(network);
    }
    setIsRecentsDropdownOpen(false);
    setPhoneVerified(true);
  };

  const handlePayClick = () => {
    if (phoneNumber && selectedPlan && phoneVerified) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (method: PaymentOption) => {
    setSelectedPaymentMethod(method);

    // Fetch Data Quote
    if (selectedPlan && phoneNumber) {
      const payload: DataQuotePayload = {
        phone: phoneNumber,
        billersCode: phoneNumber,
        variationCode: selectedPlan.id,
        purchaseAmount: selectedPlan.price,
        sourceCurrencyTicker: method.currency || "NGN", // Default if fiat
        walletId: method.walletId || method.id,
        baseCostCurrency: "NGN",
        serviceId: selectedNetwork.id.toUpperCase() // e.g., AIRTEL, MTN
      };

      quoteMutation.mutate(payload);
    }
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod || !selectedPlan) return "0";
    const amountNum = selectedPlan.price;

    // Use quote data if available
    if (quote) {
      return `${quote.deductionAmount.toFixed(6)} ${quote.deductionCurrency.toUpperCase()}`;
    }

    if (selectedPaymentMethod.type === "fiat") {
      return `₦${amountNum.toLocaleString()}.00`;
    }

    // Fallback mock conversion rates for crypto
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
    return selectedPlan?.cashback || 0;
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

  const handlePinComplete = (pin: string) => {
    setPinError(""); // Reset previous errors

    // Retrieve quote for Data
    const storedQuote = localStorage.getItem("currentDataQuote");
    let quoteReference = "";

    if (storedQuote) {
      const parsed = JSON.parse(storedQuote);
      quoteReference = parsed.quoteReference;
    }

    if (!quoteReference) {
      setFailureReason("Session expired or invalid quote. Please try again.");
      setTransactionResult("failure");
      setStep("result");
      return;
    }

    const payload: BillExecutionPayload = {
      quoteReference: quoteReference,
      pin: parseInt(pin, 10) // or string if your API expects string, interface says string | number
    };

    paymentMutation.mutate(payload);
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
      <PaymentMethod
        onBack={() => setStep("form")}
        onSelect={handlePaymentMethodSelect}
        amount={selectedPlan?.price || 0}
      />
    );
  }

  if (step === "confirmation" && selectedPaymentMethod && selectedPlan) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={selectedPlan.price}
        paymentAmount={calculatePaymentAmount()}
        details={[
          { label: "Network", value: selectedNetwork.name },
          { label: "Phone Number", value: phoneNumber },
          { label: "Data Plan", value: selectedPlan.data },
          { label: "Duration", value: selectedPlan.duration },
          { label: "Amount", value: `₦${selectedPlan.price.toLocaleString()}.00` },
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
        error={pinError}
      />
    );
  }

  if (step === "result" && selectedPaymentMethod && selectedPlan) {
    const paymentAmount = calculatePaymentAmount();
    const amountNum = selectedPlan.price;
    const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;

    const commonDetails = [
      { label: "Network", value: selectedNetwork.name },
      { label: "Phone Number", value: phoneNumber },
      { label: "Data Plan", value: selectedPlan.data },
      { label: "Duration", value: selectedPlan.duration },
      { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` },
    ];

    if (transactionResult === "success") {
      const metadata = transactionDetails?.metadata || {};
      const successDetails = [
        ...commonDetails,
        { label: "Transaction Reference", value: transactionToken },
        { label: "Bonus Earned", value: `₦${getCashback().toFixed(2)} Cashback` },
        { label: "Transaction Date", value: getTransactionDate() },
      ];

      return (
        <PaymentSuccess
          title="Data Purchase Successful"
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
          title="Data Purchase Failed"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          details={failureDetails}
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
        <h1 className="text-2xl font-bold text-white">Data</h1>
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

        {/* Offer Categories */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOfferCategory("hot-offers")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${offerCategory === "hot-offers"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Hot Offers
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setOfferCategory("daily")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${offerCategory === "daily"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Daily
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setOfferCategory("weekly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${offerCategory === "weekly"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Select Plan Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Select Plan</label>
          <div className="grid grid-cols-3 gap-3">
            {isPlansLoading ? (
              <div className="col-span-3 flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : filteredPlans.length > 0 ? (
              filteredPlans.map((plan, i) => (
                <button
                  key={`${plan.id}-${i}`}
                  onClick={() => handlePlanSelect(plan)}
                  className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${selectedPlan?.id === plan.id
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : ""
                    }`}
                >
                  <span className="text-white font-bold text-base mb-1">
                    {plan.data}
                  </span>
                  <span className="text-white font-bold text-lg mb-1">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-xs mb-1">
                    {plan.duration}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ₦{plan.cashback} Cashback
                  </span>
                </button>
              ))) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                No plans available for this network.
              </div>
            )}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!phoneNumber || !selectedPlan || !phoneVerified}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!phoneNumber || !selectedPlan || !phoneVerified
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
