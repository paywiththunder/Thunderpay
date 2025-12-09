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

const hotOffersPlans: DataPlan[] = [
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
  const [transactionToken, setTransactionToken] = useState("");

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

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (phoneNumber && selectedPlan) {
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
        paymentMethod={
          selectedPaymentMethod.type === "fiat"
            ? "Fiat"
            : `Crypto (${selectedPaymentMethod.name})`
        }
        biller={selectedNetwork.name}
        meterNumber={phoneNumber}
        customerName={phoneNumber}
        meterType="Data"
        serviceAddress=""
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
          biller={selectedNetwork.name}
          meterNumber={phoneNumber}
          customerName={phoneNumber}
          meterType="Data"
          serviceAddress=""
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
          biller={selectedNetwork.name}
          meterNumber={phoneNumber}
          customerName={phoneNumber}
          meterType="Data"
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
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                offerCategory === "hot-offers"
                  ? "bg-gray-700 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Hot Offers
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setOfferCategory("daily")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                offerCategory === "daily"
                  ? "bg-gray-700 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Daily
            </button>
            <div className="w-px bg-white/20"></div>
            <button
              onClick={() => setOfferCategory("weekly")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                offerCategory === "weekly"
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
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!phoneNumber || !selectedPlan || !phoneVerified}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !phoneNumber || !selectedPlan || !phoneVerified
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
