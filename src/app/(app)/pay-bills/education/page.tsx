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

interface Service {
  id: string;
  name: string;
}

interface ExamType {
  id: string;
  name: string;
  amount: number;
  hasExamType: boolean;
  examTypes?: string[];
}

const services: Service[] = [
  { id: "result-checker", name: "Result checker pin" },
  { id: "registration", name: "Registration" },
];

const examTypes: ExamType[] = [
  {
    id: "waec",
    name: "WAEC",
    amount: 3250,
    hasExamType: true,
    examTypes: ["May / June", "Nov / Dec", "GCE"],
  },
  {
    id: "jamb",
    name: "JAMB",
    amount: 3500,
    hasExamType: false,
  },
  {
    id: "neco",
    name: "NECO",
    amount: 3000,
    hasExamType: true,
    examTypes: ["June / July", "Nov / Dec"],
  },
];

const examYears = ["2025", "2024", "2023", "2022", "2021"];

type Step = "form" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;

export default function EducationPage() {
  const router = useRouter();
  const examTypeDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("form");
  const [selectedExamType, setSelectedExamType] = useState<ExamType>(
    examTypes[0]
  );
  const [isExamTypeDropdownOpen, setIsExamTypeDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service>(services[0]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(examYears[0]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedExamTypeOption, setSelectedExamTypeOption] = useState(
    selectedExamType.examTypes?.[0] || ""
  );
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");

  // Reset exam type option when exam type changes
  useEffect(() => {
    if (selectedExamType.examTypes && selectedExamType.examTypes.length > 0) {
      setSelectedExamTypeOption(selectedExamType.examTypes[0]);
    } else {
      setSelectedExamTypeOption("");
    }
  }, [selectedExamType]);

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setStep("confirmation");
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod) return "0";
    const amountNum = selectedExamType.amount;

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

  const getMeterNumber = (): string => {
    let result = `${selectedService.name} - ${selectedYear}`;
    if (selectedExamType.hasExamType && selectedExamTypeOption) {
      result += ` - ${selectedExamTypeOption}`;
    }
    return result;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        examTypeDropdownRef.current &&
        !examTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExamTypeDropdownOpen(false);
      }
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServiceDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (
      isExamTypeDropdownOpen ||
      isServiceDropdownOpen ||
      isYearDropdownOpen ||
      isTypeDropdownOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isExamTypeDropdownOpen,
    isServiceDropdownOpen,
    isYearDropdownOpen,
    isTypeDropdownOpen,
  ]);

  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("form")}
        onSelect={handlePaymentMethodSelect}
        amount={selectedExamType.amount}
      />
    );
  }

  if (step === "confirmation" && selectedPaymentMethod) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={selectedExamType.amount}
        paymentAmount={calculatePaymentAmount()}
        paymentMethod={
          selectedPaymentMethod.type === "fiat"
            ? "Fiat"
            : `Crypto (${selectedPaymentMethod.name})`
        }
        biller={selectedExamType.name}
        meterNumber={getMeterNumber()}
        customerName={selectedExamType.name}
        meterType={selectedService.name}
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

  if (step === "result" && selectedPaymentMethod) {
    const paymentAmount = calculatePaymentAmount();
    const amountEquivalent = `≈ ₦${selectedExamType.amount.toLocaleString()}.00`;

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedExamType.name}
          meterNumber={getMeterNumber()}
          customerName={selectedExamType.name}
          meterType={selectedService.name}
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
          biller={selectedExamType.name}
          meterNumber={getMeterNumber()}
          customerName={selectedExamType.name}
          meterType={selectedService.name}
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

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Education</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Exam Type Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Exam Type</label>
          <div className="relative" ref={examTypeDropdownRef}>
            <button
              onClick={() => setIsExamTypeDropdownOpen(!isExamTypeDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {selectedExamType.name.charAt(0)}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {selectedExamType.name}
                </span>
              </div>
              {isExamTypeDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isExamTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {examTypes.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      setSelectedExamType(exam);
                      setIsExamTypeDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {exam.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white font-medium">{exam.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Select Service Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Select Service</label>
          <div className="relative" ref={serviceDropdownRef}>
            <button
              onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-white font-medium">
                {selectedService.name}
              </span>
              {isServiceDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isServiceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setIsServiceDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">
                      {service.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exam Year Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Exam Year</label>
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-white font-medium">{selectedYear}</span>
              <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                {examYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsYearDropdownOpen(false);
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className="text-white font-medium">{year}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exam Type Option Section (Only for WAEC and NECO) */}
        {selectedExamType.hasExamType && selectedExamType.examTypes && (
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Exam Type</label>
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-white font-medium">
                  {selectedExamTypeOption}
                </span>
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  {selectedExamType.examTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedExamTypeOption(type);
                        setIsTypeDropdownOpen(false);
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
        )}

        {/* Amount Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Amount</label>
          <input
            type="text"
            value={`₦${selectedExamType.amount.toLocaleString()}.00`}
            readOnly
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white px-4 py-3.5 rounded-2xl text-sm cursor-not-allowed opacity-70"
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
