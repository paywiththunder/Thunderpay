"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiChevronDown } from "react-icons/hi2";
import PaymentMethod, {
  PaymentOption,
} from "@/components/payment/PaymentMethod";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";

interface InsuranceProvider {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
}

const insuranceProviders: InsuranceProvider[] = [
  { id: "hygeia", name: "Hygeia HMO Limited" },
  { id: "leadway", name: "Leadway Health" },
];

const plans: Plan[] = [
  { id: "family", name: "Health - Family Plan" },
  { id: "individual", name: "Health - Individual Plan" },
  { id: "corporate", name: "Health - Corporate Plan" },
];

const paymentFrequencies = ["Monthly", "Quarterly", "Yearly"];

const fixedAmount = 30250;

type Step = "providers" | "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

export default function HealthInsurancePage() {
  const router = useRouter();
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const planDropdownRef = useRef<HTMLDivElement>(null);
  const frequencyDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("providers");
  const [selectedProvider, setSelectedProvider] =
    useState<InsuranceProvider | null>(null);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [isFrequencyDropdownOpen, setIsFrequencyDropdownOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [selectedFrequency, setSelectedFrequency] = useState(
    paymentFrequencies[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");

  const handleProviderSelect = (provider: InsuranceProvider) => {
    setSelectedProvider(provider);
    setStep("form");
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedProvider && referenceNumber) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setStep("confirmation");
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod) return "0";

    if (selectedPaymentMethod.type === "fiat") {
      return `₦${fixedAmount.toLocaleString()}.00`;
    }

    const rates: { [key: string]: number } = {
      usdt: 1.0,
      bitcoin: 0.000023,
      ethereum: 0.00042,
      solana: 0.006,
    };

    const rate = rates[selectedPaymentMethod.id] || 1;
    const cryptoAmount = fixedAmount / (rate * 1500);

    if (selectedPaymentMethod.id === "usdt") {
      return `${cryptoAmount.toFixed(4)} USDT`;
    } else if (selectedPaymentMethod.id === "bitcoin") {
      return `${cryptoAmount.toFixed(8)} BTC`;
    } else if (selectedPaymentMethod.id === "ethereum") {
      return `${cryptoAmount.toFixed(6)} ETH`;
    } else if (selectedPaymentMethod.id === "solana") {
      return `${cryptoAmount.toFixed(4)} SOL`;
    }

    return `₦${fixedAmount.toLocaleString()}.00`;
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

  const handleContinueFromResult = () => {
    setStep("form");
    setTransactionResult(null);
    setTransactionToken("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyDropdownOpen(false);
      }
      if (
        planDropdownRef.current &&
        !planDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlanDropdownOpen(false);
      }
      if (
        frequencyDropdownRef.current &&
        !frequencyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFrequencyDropdownOpen(false);
      }
    };

    if (
      isCompanyDropdownOpen ||
      isPlanDropdownOpen ||
      isFrequencyDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCompanyDropdownOpen, isPlanDropdownOpen, isFrequencyDropdownOpen]);

  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("form")}
        onSelect={handlePaymentMethodSelect}
        amount={fixedAmount}
      />
    );
  }

  if (step === "confirmation" && selectedPaymentMethod && selectedProvider) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={fixedAmount}
        paymentAmount={calculatePaymentAmount()}
        paymentMethod={
          selectedPaymentMethod.type === "fiat"
            ? "Fiat"
            : `Crypto (${selectedPaymentMethod.name})`
        }
        biller={selectedProvider.name}
        meterNumber={referenceNumber}
        customerName={selectedProvider.name}
        meterType={selectedPlan.name}
        serviceAddress=""
        cashback={0}
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

  if (step === "result" && selectedPaymentMethod && selectedProvider) {
    const paymentAmount = calculatePaymentAmount();
    const amountEquivalent = `≈ ₦${fixedAmount.toLocaleString()}.00`;

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedProvider.name}
          meterNumber={referenceNumber}
          customerName={selectedProvider.name}
          meterType={selectedPlan.name}
          serviceAddress=""
          paymentMethod={
            selectedPaymentMethod.type === "fiat"
              ? "Fiat"
              : selectedPaymentMethod.name
          }
          bonusEarned="₦0.00 Cashback"
          transactionDate={getTransactionDate()}
          onAddToBeneficiary={handleAddToBeneficiary}
          onContinue={handleContinueFromResult}
        />
      );
    } else if (transactionResult === "failure") {
      return (
        <PaymentFailure
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          failureReason="Service provider down"
          biller={selectedProvider.name}
          meterNumber={referenceNumber}
          customerName={selectedProvider.name}
          meterType={selectedPlan.name}
          serviceAddress=""
          paymentMethod={
            selectedPaymentMethod.type === "fiat"
              ? "Fiat"
              : selectedPaymentMethod.name
          }
          transactionDate={getTransactionDate()}
          onContinue={handleContinueFromResult}
        />
      );
    }
  }

  // Providers List Step
  if (step === "providers") {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => router.back()}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Health Insurance</h1>
        </header>

        <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
          {insuranceProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderSelect(provider)}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <span className="text-white font-medium text-base">
                  {provider.name}
                </span>
              </div>
              <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Form Step
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => setStep("providers")}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Health Insurance</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Select Insurance Company Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Insurance Company
          </label>
          <div className="relative" ref={companyDropdownRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedProvider?.name.charAt(0) || "H"}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {selectedProvider?.name || "Select Company"}
                </span>
              </div>
              {isCompanyDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {insuranceProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {provider.name.charAt(0)}
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

        {/* Reference Number Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g 123456789123"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Select Plan Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Select Plan</label>
          <div className="relative" ref={planDropdownRef}>
            <button
              onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-white font-medium">{selectedPlan.name}</span>
              <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
            </button>

            {isPlanDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsPlanDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">{plan.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Frequency Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Payment Frequency
          </label>
          <div className="relative" ref={frequencyDropdownRef}>
            <button
              onClick={() =>
                setIsFrequencyDropdownOpen(!isFrequencyDropdownOpen)
              }
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-white font-medium">
                {selectedFrequency}
              </span>
              <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
            </button>

            {isFrequencyDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {paymentFrequencies.map((frequency) => (
                  <button
                    key={frequency}
                    onClick={() => {
                      setSelectedFrequency(frequency);
                      setIsFrequencyDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">{frequency}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Amount</label>
          <input
            type="text"
            value={`₦${fixedAmount.toLocaleString()}.00`}
            readOnly
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white px-4 py-3.5 rounded-2xl text-sm cursor-not-allowed opacity-70"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedProvider || !referenceNumber}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !selectedProvider || !referenceNumber
              ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
              : ""
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

