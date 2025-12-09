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
];

const hotOffersPlans: TVPlan[] = [
  { id: "smallie", name: "Smallie", price: 1900, duration: "1 Month", cashback: 19 },
  { id: "jinja", name: "Jinja", price: 3900, duration: "1 Month", cashback: 39 },
  { id: "jolli", name: "Jolli", price: 5800, duration: "1 Month", cashback: 58 },
  { id: "max", name: "Max", price: 8500, duration: "1 Month", cashback: 85 },
  { id: "supa", name: "Supa", price: 11400, duration: "1 Month", cashback: 114 },
  { id: "supa-plus", name: "Supa plus", price: 16800, duration: "1 Month", cashback: 168 },
];

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
  const [selectedPlan, setSelectedPlan] = useState<TVPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [decoderVerified, setDecoderVerified] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");

  // Mock decoder verification
  useEffect(() => {
    if (decoderNumber.length >= 10) {
      const timer = setTimeout(() => {
        setDecoderVerified(true);
        setCustomerName("Newton Afobaje Arowolo");
        setDueDate("Oct 20, 2025");
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDecoderVerified(false);
      setCustomerName("");
      setDueDate("");
    }
  }, [decoderNumber]);

  const handlePlanSelect = (plan: TVPlan) => {
    setSelectedPlan(plan);
  };

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (decoderNumber && selectedPlan) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setStep("confirmation");
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
    const token = generateTransactionToken();
    setTransactionToken(token);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isSuccess = Math.random() > 0.3;
    setTransactionResult(isSuccess ? "success" : "failure");
    setStep("result");
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
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={selectedPlan.price}
        paymentAmount={calculatePaymentAmount()}
        paymentMethod={
          selectedPaymentMethod.type === "fiat"
            ? "Fiat"
            : `Crypto (${selectedPaymentMethod.name})`
        }
        biller={selectedProvider.name}
        meterNumber={decoderNumber}
        customerName={customerName || "N/A"}
        meterType={paymentOption}
        serviceAddress="10 rd, 20 Sanusi Estate Baruwa Lagos"
        cashback={getCashback()}
        availableBalance={getAvailableBalance()}
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
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          failureReason="Service provider down"
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
          {decoderVerified && customerName ? (
            <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex flex-col flex-grow">
                <span className="text-white font-medium">{customerName}</span>
                <span className="text-gray-400 text-sm">
                  Due Date: {dueDate}
                </span>
                <span className="text-gray-400 text-sm">
                  {decoderNumber.slice(0, 3)}**{decoderNumber.slice(-3)}
                </span>
              </div>
              <HiCheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
            </div>
          ) : (
            <input
              type="text"
              value={decoderNumber}
              onChange={(e) => setDecoderNumber(e.target.value)}
              placeholder="e.g 00000000000"
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          )}
          <div className="flex justify-end">
            <button className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors">
              See Beneficiaries
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Payment Options */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setPaymentOption("hot-offers")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                paymentOption === "hot-offers"
                  ? "bg-gray-700 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Hot Offers
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setPaymentOption("monthly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                paymentOption === "monthly"
                  ? "bg-gray-700 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setPaymentOption("quarterly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                paymentOption === "quarterly"
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
          <label className="text-white text-sm font-medium">Select Plan</label>
          <div className="grid grid-cols-2 gap-3">
            {hotOffersPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${
                  selectedPlan?.id === plan.id
                    ? "ring-2 ring-blue-500 border-blue-500"
                    : ""
                }`}
              >
                <span className="text-white font-bold text-base mb-1">
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
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!decoderNumber || !selectedPlan || !decoderVerified}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !decoderNumber || !selectedPlan || !decoderVerified
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
