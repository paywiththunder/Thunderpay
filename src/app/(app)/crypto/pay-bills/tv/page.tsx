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
import {
  getTvPlans,
  getTvQuote,
  TvQuotePayload,
  executeBillPayment,
  BillExecutionResponse,
  DataPlan as ApiTvPlan,
  verifyTv
} from "@/services/bills";

interface CableTVProvider {
  id: string;
  name: string;
  logo: string;
}

interface TVPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  cashback: number;
}

const cableTVProviders: CableTVProvider[] = [
  { id: "gotv", name: "GOTV", logo: "GO" },
  { id: "dstv", name: "DSTV", logo: "DS" },
  { id: "startimes", name: "StarTimes", logo: "ST" },
  { id: "showmax", name: "Showmax", logo: "SM" },
];

const FALLBACK_PLANS: TVPlan[] = [];

type Step = "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;
type PaymentOptionType = "hot-offers" | "monthly" | "quarterly";

export default function TVPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [selectedProvider, setSelectedProvider] = useState<CableTVProvider>(
    cableTVProviders[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState<PaymentOptionType>("hot-offers");
  const [decoderNumber, setDecoderNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<TVPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [decoderVerified, setDecoderVerified] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinError, setPinError] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);

  const [availablePlans, setAvailablePlans] = useState<TVPlan[]>(FALLBACK_PLANS);
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsPlansLoading(true);
      try {
        const response = await getTvPlans(selectedProvider.id);
        if (response.success && response.data) {
          // Map API plans to UI structure
          const mappedPlans: TVPlan[] = response.data.map((p: ApiTvPlan) => {
            // Extract duration from name if possible
            // Example name: "DStv Yanga - 1 Month" or "N100 100MB - 24 hrs"
            // Usually TV plans have clear names.
            let duration = "1 Month"; // Default
            if (p.name.toLowerCase().includes("3 month") || p.name.toLowerCase().includes("quarter")) {
              duration = "3 Months";
            } else if (p.name.toLowerCase().includes("month")) {
              duration = "1 Month"; // Simplified check
            } else if (p.name.toLowerCase().includes("year") || p.name.toLowerCase().includes("annual")) {
              duration = "1 Year";
            } else if (p.name.toLowerCase().includes("day")) {
              duration = "1 Day";
            }

            return {
              id: p.variation_code,
              name: p.name,
              price: parseFloat(p.variation_amount),
              duration: duration,
              cashback: 0
            };
          });
          setAvailablePlans(mappedPlans);
        }
      } catch (error) {
        console.error("Failed to fetch tv plans", error);
        setAvailablePlans([]);
      } finally {
        setIsPlansLoading(false);
      }
    };

    fetchPlans();
  }, [selectedProvider]);

  // TV Verification
  useEffect(() => {
    const verifyDecoder = async () => {
      if (decoderNumber.length >= 10 && selectedProvider) {
        setDecoderVerified(false);
        setCustomerName("");
        setDueDate(""); // Reset due date

        try {
          const response = await verifyTv({
            serviceId: selectedProvider.id.toUpperCase(), // Ensure uppercase for API (GOTV, DSTV etc)
            billersCode: decoderNumber
          });

          if (response.success && response.data?.verified) {
            setDecoderVerified(true);
            setCustomerName(response.data.name);
            // API doesn't seem to return due date in the sample, but if it does, set it here.
            // For now leaving due date empty or static if needed.
            // setDueDate("Oct 20, 2025"); 
          } else {
            setDecoderVerified(false);
            setCustomerName("");
          }
        } catch (error) {
          console.error("Verification error:", error);
          setDecoderVerified(false);
          setCustomerName("");
        }
      } else {
        setDecoderVerified(false);
        setCustomerName("");
        setDueDate("");
      }
    };

    const timer = setTimeout(() => {
      verifyDecoder();
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [decoderNumber, selectedProvider]);

  const getFilteredPlans = () => {
    if (!availablePlans.length) return [];

    return availablePlans.filter((plan) => {
      const durationLower = plan.duration.toLowerCase();

      switch (paymentOption) {
        case "monthly":
          return durationLower === "1 month" || durationLower.includes("month") && !durationLower.includes("3") && !durationLower.includes("year");
        case "quarterly":
          return durationLower.includes("quarter") || durationLower.includes("3 month");
        case "hot-offers":
        default:
          // For now, "Hot Offers" can just be Monthly or everything if no logic specified.
          // Usually "Hot Offers" highlights popular ones. Let's make it show Monthly as typical default, 
          // or use a specific list if we had one.
          // User said "sort their value hot offeres, monthly.." -> Implies categorization.
          // Let's make Hot Offers show everything or just 1 Month?
          // Let's show everything but prioritized/sorted if possible?
          // Or just return everything for Hot Offers so user sees all? 
          // Filter out Quarterly/Annual from Hot Offers to keep it cheap?
          // Let's show Monthly for "Hot Offers" as it's the standard.
          return durationLower.includes("month") && !durationLower.includes("3");
      }
    });
  };

  const filteredPlans = getFilteredPlans();

  const handlePlanSelect = (plan: TVPlan) => {
    setSelectedPlan(plan);
  };

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (decoderNumber && selectedPlan) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = async (method: PaymentOption) => {
    setSelectedPaymentMethod(method);

    // Fetch TV Quote
    if (selectedPlan && decoderNumber) {
      setIsProcessing(true);
      try {
        const serviceId = selectedProvider.id.toUpperCase();
        let subscription_type: "change" | "renew" | null = null;

        // Only DSTV and GOTV require subscription_type
        if (["DSTV", "GOTV"].includes(serviceId)) {
          subscription_type = "change";
        }

        const payload: TvQuotePayload = {
          serviceId: serviceId,
          billersCode: decoderNumber,
          variationCode: selectedPlan.id,
          purchaseAmount: selectedPlan.price,
          phone: phoneNumber,
          quantity: quantity,
          sourceCurrencyTicker: method.currency ?? "NGN",
          walletId: isNaN(Number(method.id)) ? method.id : Number(method.id),
          baseCostCurrency: "NGN",
          subscription_type: subscription_type
        };

        const response = await getTvQuote(payload);
        console.log("TV Quote Response", response);
        if (response.success && response.data) {
          const quoteData = response.data;
          localStorage.setItem("currentTvQuote", JSON.stringify(quoteData));
          setQuoteData(quoteData);
          setStep("confirmation");
        } else {
          setFailureReason(response.description || "Failed to generate quote");
          setTransactionResult("failure");
          setStep("result");
        }
      } catch (error: any) {
        console.error("Quote Error", error);
        setFailureReason(error?.description || error?.message || "Failed to generate quote");
        setTransactionResult("failure");
        setStep("result");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod || !selectedPlan) return "0";
    const amountNum = selectedPlan.price;

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

  const handlePinComplete = async (pin: string) => {
    setIsProcessing(true);
    setPinError("");

    try {
      const storedQuote = localStorage.getItem("currentTvQuote");
      let quoteReference = "";

      if (storedQuote) {
        const parsed = JSON.parse(storedQuote);
        quoteReference = parsed.quoteReference;
      }

      if (!quoteReference) {
        throw new Error("Session expired or invalid quote. Please try again.");
      }

      const payload = {
        quoteReference: quoteReference,
        pin: pin // Sending as string
      };

      const response = (await executeBillPayment(payload)) as BillExecutionResponse;

      if (response.success && response.data) {
        setTransactionToken(response.data.transactionReference);
        setTransactionResult("success");
        setStep("result");
      } else {
        const reason = response.description || "Payment failed";
        if (reason.toLowerCase().includes("pin")) {
          setPinError(reason);
        } else {
          setFailureReason(reason);
          setTransactionResult("failure");
          setStep("result");
        }
      }
    } catch (error: any) {
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
    } finally {
      setIsProcessing(false);
      localStorage.removeItem("currentTvQuote");
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
    const details = [
      { label: "Biller", value: selectedProvider.name },
      { label: "Smartcard Number", value: decoderNumber },
      { label: "Account Name", value: customerName || "N/A" },
      { label: "Package", value: selectedPlan.name },
      { label: "Payment Method", value: selectedPaymentMethod.type === "fiat" ? "Fiat" : `Crypto (${selectedPaymentMethod.name})` },
    ];

    if (quoteData && quoteData.transactionFee > 0) {
      details.push({ label: "Transaction Fee", value: `₦${quoteData.transactionFee}` });
    }

    const cashback = getCashback();
    if (cashback > 0) {
      details.push({ label: "Bonus to Earn", value: `₦${cashback.toFixed(2)} Cashback` });
    }

    let displayAmount = calculatePaymentAmount();
    if (quoteData?.deductionAmount && selectedPaymentMethod.type !== "fiat") {
      displayAmount = `${Number(quoteData.deductionAmount).toFixed(6)} ${quoteData.deductionCurrency}`;
    }

    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={selectedPlan.price}
        paymentAmount={displayAmount}
        availableBalance={getAvailableBalance()}
        details={details}
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

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedProvider.name}
          meterNumber={decoderNumber}
          customerName={customerName || "N/A"}
          meterType={paymentOption}
          serviceAddress="10 rd, 20 Sanusi Estate Baruwa Lagos"
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
          title="TV Subscription Failed"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          failureReason={failureReason || "Service provider down"}
          biller={selectedProvider.name}
          meterNumber={decoderNumber}
          customerName={customerName || "N/A"}
          meterType={paymentOption}
          serviceAddress="10 rd, 20 Sanusi Estate Baruwa Lagos"
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
        <h1 className="text-2xl font-bold text-white">TV</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Cable TV Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Cable TV</label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
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

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {cableTVProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
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

        {/* Decoder Number Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Decoder Number
          </label>
          <input
            type="text"
            value={decoderNumber}
            onChange={(e) => setDecoderNumber(e.target.value)}
            placeholder="e.g 00000000000"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
          {decoderVerified && customerName && (
            <div className="flex flex-col px-1">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-white font-medium text-sm">{customerName}</span>
              </div>
              {dueDate && (
                <span className="text-gray-400 text-xs ml-6">
                  Due Date: {dueDate}
                </span>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <button className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors">
              See Beneficiaries
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phone Number Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g 08012345678"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Payment Options */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setPaymentOption("hot-offers")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentOption === "hot-offers"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Hot Offers
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setPaymentOption("monthly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentOption === "monthly"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Monthly
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setPaymentOption("quarterly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${paymentOption === "quarterly"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
                }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Select Plan Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm font-medium">Select Plan</label>
            <div className="flex items-center gap-3 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-2 px-3">
              <span className="text-gray-400 text-xs font-medium mr-auto">Duration:</span>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-white bg-gray-800/50 hover:bg-gray-700/80 rounded-full transition-colors border border-white/10"
              >-</button>
              <span className="text-white text-sm font-bold min-w-[70px] text-center">
                {quantity} {quantity > 1 ? "Months" : "Month"}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-white bg-gray-800/50 hover:bg-gray-700/80 rounded-full transition-colors border border-white/10"
              >+</button>
            </div>
          </div>
          <div className="">
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
                    <span className="text-white font-bold text-center text-sm mb-1 leading-snug">
                      {plan.name}
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
                  No plans available for this provider.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!decoderNumber || !selectedPlan || !decoderVerified || !phoneNumber}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!decoderNumber || !selectedPlan || !decoderVerified || !phoneNumber
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
