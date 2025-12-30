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

interface Airline {
  id: string;
  name: string;
}

const airlines: Airline[] = [
  { id: "airpeace", name: "Air Peace" },
  { id: "arik", name: "Arik Air" },
];

const bookingTypes = ["Pay for Existing Booking", "New Booking"];

const fixedAmount = 30250;

type Step = "airlines" | "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

export default function FlightPage() {
  const router = useRouter();
  const airlineDropdownRef = useRef<HTMLDivElement>(null);
  const bookingTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("airlines");
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [isAirlineDropdownOpen, setIsAirlineDropdownOpen] = useState(false);
  const [isBookingTypeDropdownOpen, setIsBookingTypeDropdownOpen] =
    useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState(
    bookingTypes[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");

  const handleAirlineSelect = (airline: Airline) => {
    setSelectedAirline(airline);
    setStep("form");
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedAirline && bookingReference) {
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
        airlineDropdownRef.current &&
        !airlineDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAirlineDropdownOpen(false);
      }
      if (
        bookingTypeDropdownRef.current &&
        !bookingTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBookingTypeDropdownOpen(false);
      }
    };

    if (isAirlineDropdownOpen || isBookingTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAirlineDropdownOpen, isBookingTypeDropdownOpen]);

  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("form")}
        onSelect={handlePaymentMethodSelect}
        amount={fixedAmount}
      />
    );
  }

  if (step === "confirmation" && selectedPaymentMethod && selectedAirline) {
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
        biller={selectedAirline.name}
        meterNumber={bookingReference}
        customerName={selectedAirline.name}
        meterType={selectedBookingType}
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

  if (step === "result" && selectedPaymentMethod && selectedAirline) {
    const paymentAmount = calculatePaymentAmount();
    const amountEquivalent = `≈ ₦${fixedAmount.toLocaleString()}.00`;

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedAirline.name}
          meterNumber={bookingReference}
          customerName={selectedAirline.name}
          meterType={selectedBookingType}
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
          biller={selectedAirline.name}
          meterNumber={bookingReference}
          customerName={selectedAirline.name}
          meterType={selectedBookingType}
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

  // Airlines List Step
  if (step === "airlines") {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => router.back()}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Flight</h1>
        </header>

        <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
          {airlines.map((airline) => (
            <button
              key={airline.id}
              onClick={() => handleAirlineSelect(airline)}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {airline.name.charAt(0)}
                  </span>
                </div>
                <span className="text-white font-medium text-base">
                  {airline.name}
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
          onClick={() => setStep("airlines")}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Flight</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Select Airline Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Airline
          </label>
          <div className="relative" ref={airlineDropdownRef}>
            <button
              onClick={() => setIsAirlineDropdownOpen(!isAirlineDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedAirline?.name.charAt(0) || "A"}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {selectedAirline?.name || "Select Airline"}
                </span>
              </div>
              {isAirlineDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isAirlineDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {airlines.map((airline) => (
                  <button
                    key={airline.id}
                    onClick={() => {
                      setSelectedAirline(airline);
                      setIsAirlineDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {airline.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {airline.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Select Booking Type Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Booking Type
          </label>
          <div className="relative" ref={bookingTypeDropdownRef}>
            <button
              onClick={() =>
                setIsBookingTypeDropdownOpen(!isBookingTypeDropdownOpen)
              }
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-white font-medium">
                {selectedBookingType}
              </span>
              <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
            </button>

            {isBookingTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {bookingTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedBookingType(type);
                      setIsBookingTypeDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">{type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Reference Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Booking Reference
          </label>
          <input
            type="text"
            value={bookingReference}
            onChange={(e) => setBookingReference(e.target.value)}
            placeholder="e.g 123456789123"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Amount Section - Only show when booking reference is filled */}
        {bookingReference && (
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Amount</label>
            <input
              type="text"
              value={`₦${fixedAmount.toLocaleString()}.00`}
              readOnly
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white px-4 py-3.5 rounded-2xl text-sm cursor-not-allowed opacity-70"
            />
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedAirline || !bookingReference}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !selectedAirline || !bookingReference
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
