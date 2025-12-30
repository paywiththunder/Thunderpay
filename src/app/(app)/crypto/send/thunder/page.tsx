"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiCheckCircle } from "react-icons/hi2";
import PaymentMethod, {
  PaymentOption,
} from "@/components/payment/PaymentMethod";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";

interface RecentRecipient {
  id: string;
  name: string;
  accountNumber: string;
  type: "thunder";
  avatar?: string;
  initial?: string;
}

const recentRecipients: RecentRecipient[] = [
  {
    id: "1",
    name: "Newton Afobaje Arowolo",
    accountNumber: "9068233532",
    type: "thunder",
    initial: "N",
  },
  {
    id: "2",
    name: "Ugo Kyoshi Omotola",
    accountNumber: "9068233532",
    type: "thunder",
    initial: "U",
  },
  {
    id: "3",
    name: "Hakeem Kyoshi Omotola",
    accountNumber: "9068233532",
    type: "thunder",
    initial: "H",
  },
];

const amountOptions = [
  { amount: 1000, cashback: 10 },
  { amount: 2000, cashback: 20 },
  { amount: 3000, cashback: 30 },
  { amount: 5000, cashback: 50 },
  { amount: 10000, cashback: 100 },
  { amount: 20000, cashback: 200 },
];

type Step = "account" | "amount" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;
type TabType = "recents" | "beneficiaries";

export default function SendToThunderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<RecentRecipient | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");

  // Filter recipients based on account number input
  const filteredRecipients = recentRecipients.filter((recipient) =>
    recipient.accountNumber.includes(accountNumber)
  );

  // Auto-select recipient if account number matches exactly
  useEffect(() => {
    if (accountNumber.length >= 10) {
      const match = recentRecipients.find(
        (r) => r.accountNumber === accountNumber
      );
      if (match) {
        setSelectedRecipient(match);
      } else {
        // If no exact match, create a new recipient object
        setSelectedRecipient({
          id: "new",
          name: "Unknown User",
          accountNumber: accountNumber,
          type: "thunder",
          initial: accountNumber.charAt(0),
        });
      }
    } else {
      setSelectedRecipient(null);
    }
  }, [accountNumber]);

  const handleRecipientSelect = (recipient: RecentRecipient) => {
    setSelectedRecipient(recipient);
    setAccountNumber(recipient.accountNumber);
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handlePayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedRecipient && accountNumber.length >= 10) {
      if (!amount) {
        setStep("amount");
      } else {
        setStep("payment");
      }
    }
  };

  const handleAmountContinue = () => {
    if (amount) {
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setStep("confirmation");
  };

  const calculatePaymentAmount = (): string => {
    if (!selectedPaymentMethod || !amount) return "0";
    const amountNum = parseFloat(amount);

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
    setStep("account");
    setTransactionResult(null);
    setTransactionToken("");
    setSelectedRecipient(null);
    setAccountNumber("");
    setAmount("");
  };

  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("amount")}
        onSelect={handlePaymentMethodSelect}
        amount={parseFloat(amount) || 0}
      />
    );
  }

  if (step === "confirmation" && selectedPaymentMethod && selectedRecipient) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={parseFloat(amount) || 0}
        paymentAmount={calculatePaymentAmount()}
        paymentMethod={
          selectedPaymentMethod.type === "fiat"
            ? "Fiat"
            : `Crypto (${selectedPaymentMethod.name})`
        }
        biller="Thunder Transfer"
        meterNumber={selectedRecipient.accountNumber}
        customerName={selectedRecipient.name}
        meterType="Thunder Account"
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

  if (step === "result" && selectedPaymentMethod && selectedRecipient) {
    const paymentAmount = calculatePaymentAmount();
    const amountNum = parseFloat(amount) || 0;
    const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller="Thunder Transfer"
          meterNumber={selectedRecipient.accountNumber}
          customerName={selectedRecipient.name}
          meterType="Thunder Account"
          serviceAddress=""
          paymentMethod={
            selectedPaymentMethod.type === "fiat"
              ? "Fiat"
              : selectedPaymentMethod.name
          }
          bonusEarned={`₦${getCashback().toFixed(2)} Cashback`}
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
          biller="Thunder Transfer"
          meterNumber={selectedRecipient.accountNumber}
          customerName={selectedRecipient.name}
          meterType="Thunder Account"
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

  // Amount Entry Step
  if (step === "amount" && selectedRecipient) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => setStep("account")}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Send to Thunder</h1>
        </header>

        <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
          {/* Recipient Account Section */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">
                {selectedRecipient.initial || selectedRecipient.name.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col flex-grow">
              <span className="text-white font-medium">
                {selectedRecipient.name}
              </span>
              <span className="text-gray-400 text-sm">
                {selectedRecipient.accountNumber} Thunder
              </span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Amount:</label>
            <div className="text-4xl font-bold text-white">
              ₦{amount ? parseFloat(amount).toLocaleString() : "0"}.00
            </div>
          </div>

          {/* Amount Buttons Grid */}
          <div className="grid grid-cols-3 gap-3">
            {amountOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => handleAmountSelect(option.amount)}
                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${
                  amount === option.amount.toString()
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

          {/* Pay Button */}
          <button
            onClick={handleAmountContinue}
            disabled={!amount}
            className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
              !amount
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

  // Account Entry Step
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Send to Thunder</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Thunder Account Number Input */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Thunder Account Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="enter account number"
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab("recents")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "recents"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Recents
          </button>
          <div className="w-px bg-white/20"></div>
          <button
            onClick={() => setActiveTab("beneficiaries")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "beneficiaries"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Beneficiaries
          </button>
        </div>

        {/* Recipients List */}
        <div className="flex flex-col gap-3">
          {(activeTab === "recents" ? filteredRecipients : recentRecipients).map(
            (recipient) => (
              <button
                key={recipient.id}
                onClick={() => handleRecipientSelect(recipient)}
                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors ${
                  selectedRecipient?.id === recipient.id
                    ? "bg-blue-500/20 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {recipient.initial || recipient.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">
                      {recipient.name}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {recipient.accountNumber} Thunder
                    </span>
                  </div>
                </div>
                {selectedRecipient?.id === recipient.id && (
                  <HiCheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                )}
              </button>
            )
          )}
        </div>

        {/* See more button */}
        <button className="text-blue-500 text-sm font-medium text-center hover:text-blue-400 transition-colors">
          See more
        </button>

        {/* Pay Button */}
        <button
          onClick={handlePayClick}
          disabled={!selectedRecipient || accountNumber.length < 10}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !selectedRecipient || accountNumber.length < 10
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

