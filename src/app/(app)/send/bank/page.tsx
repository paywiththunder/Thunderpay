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

interface Bank {
  id: string;
  name: string;
  code: string;
  logo: string;
}

interface RecentBankRecipient {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  initial?: string;
}

const banks: Bank[] = [
  { id: "access", name: "Access Bank", code: "044", logo: "A" },
  { id: "gtb", name: "Guaranty Trust Bank", code: "058", logo: "G" },
  { id: "firstbank", name: "First Bank of Nigeria", code: "011", logo: "F" },
  { id: "uba", name: "United Bank for Africa", code: "033", logo: "U" },
  { id: "zenith", name: "Zenith Bank", code: "057", logo: "Z" },
  { id: "fidelity", name: "Fidelity Bank", code: "070", logo: "F" },
  { id: "union", name: "Union Bank", code: "032", logo: "U" },
  { id: "sterling", name: "Sterling Bank", code: "232", logo: "S" },
  { id: "ecobank", name: "Ecobank Nigeria", code: "050", logo: "E" },
  { id: "wema", name: "Wema Bank", code: "035", logo: "W" },
  { id: "stanbic", name: "Stanbic IBTC Bank", code: "221", logo: "S" },
  { id: "providus", name: "Providus Bank", code: "101", logo: "P" },
];

const amountOptions = [
  { amount: 1000, cashback: 10 },
  { amount: 2000, cashback: 20 },
  { amount: 5000, cashback: 50 },
  { amount: 10000, cashback: 100 },
  { amount: 20000, cashback: 200 },
  { amount: 50000, cashback: 500 },
];

const recentRecipients: RecentBankRecipient[] = [
  {
    id: "1",
    name: "John Adebayo",
    accountNumber: "0123456789",
    bankName: "Access Bank",
    bankCode: "044",
    initial: "J",
  },
  {
    id: "2",
    name: "Sarah Okoro",
    accountNumber: "9876543210",
    bankName: "GTBank",
    bankCode: "058",
    initial: "S",
  },
  {
    id: "3",
    name: "Michael Chukwu",
    accountNumber: "5555666677",
    bankName: "Zenith Bank",
    bankCode: "057",
    initial: "M",
  },
];

type Step = "bank" | "account" | "amount" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;
type TabType = "recents" | "beneficiaries";

export default function SendToBankPage() {
  const router = useRouter();
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("bank");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<RecentBankRecipient | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  // Filter recipients based on selected bank and account number
  const filteredRecipients = recentRecipients.filter((recipient) => {
    const matchesBank = !selectedBank || recipient.bankCode === selectedBank.code;
    const matchesAccount = accountNumber.length === 0 || recipient.accountNumber.includes(accountNumber);
    return matchesBank && matchesAccount;
  });

  // Auto-verify account number when bank and account number are provided
  useEffect(() => {
    if (selectedBank && accountNumber.length >= 10) {
      setIsVerifyingAccount(true);
      const timer = setTimeout(() => {
        // Mock account verification
        const match = recentRecipients.find(
          (r) => r.accountNumber === accountNumber && r.bankCode === selectedBank.code
        );
        if (match) {
          setAccountName(match.name);
          setSelectedRecipient(match);
        } else {
          // Mock: generate a fake name for demo
          setAccountName("Account Verified");
        }
        setIsVerifyingAccount(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAccountName("");
      setSelectedRecipient(null);
    }
  }, [accountNumber, selectedBank]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBankDropdownOpen(false);
      }
    };

    if (isBankDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBankDropdownOpen]);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setIsBankDropdownOpen(false);
    // Clear account details when bank changes
    setAccountNumber("");
    setAccountName("");
    setSelectedRecipient(null);
  };

  const handleRecipientSelect = (recipient: RecentBankRecipient) => {
    setSelectedRecipient(recipient);
    setAccountNumber(recipient.accountNumber);
    const bank = banks.find((b) => b.code === recipient.bankCode);
    if (bank) {
      setSelectedBank(bank);
    }
    setAccountName(recipient.name);
  };

  const handleBankContinue = () => {
    if (selectedBank) {
      setStep("account");
    }
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleAccountContinue = () => {
    if (selectedBank && accountNumber.length >= 10 && accountName) {
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
    return `${month} ${day}, ${month} ${displayHours}:${minutes
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
    setStep("bank");
    setTransactionResult(null);
    setTransactionToken("");
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setSelectedRecipient(null);
    setAmount("");
  };

  // Payment Method Step
  if (step === "payment") {
    return (
      <PaymentMethod
        onBack={() => setStep("amount")}
        onSelect={handlePaymentMethodSelect}
        amount={parseFloat(amount) || 0}
      />
    );
  }

  // Confirmation Step
  if (step === "confirmation" && selectedPaymentMethod && selectedBank) {
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
        biller={selectedBank.name}
        meterNumber={accountNumber}
        customerName={accountName}
        meterType="Bank Transfer"
        serviceAddress=""
        cashback={getCashback()}
        availableBalance={getAvailableBalance()}
      />
    );
  }

  // Enter PIN Step
  if (step === "enterPin") {
    return (
      <EnterPin
        onBack={() => setStep("confirmation")}
        onComplete={handlePinComplete}
      />
    );
  }

  // Result Step
  if (step === "result" && selectedPaymentMethod && selectedBank) {
    const paymentAmount = calculatePaymentAmount();
    const amountNum = parseFloat(amount) || 0;
    const amountEquivalent = `≈ ₦${amountNum.toLocaleString()}.00`;

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller={selectedBank.name}
          meterNumber={accountNumber}
          customerName={accountName}
          meterType="Bank Transfer"
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
          failureReason="Transaction failed"
          biller={selectedBank.name}
          meterNumber={accountNumber}
          customerName={accountName}
          meterType="Bank Transfer"
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
  if (step === "amount" && selectedBank) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => setStep("account")}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Send to Bank</h1>
        </header>

        <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
          {/* Recipient Account Section */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">
                {selectedRecipient?.initial || accountName.charAt(0) || "?"}
              </span>
            </div>
            <div className="flex flex-col flex-grow">
              <span className="text-white font-medium">
                {accountName || "Unknown"}
              </span>
              <span className="text-gray-400 text-sm">
                {accountNumber} • {selectedBank.name}
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

          {/* Custom Amount Input */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">
              Enter Custom Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
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
  if (step === "account" && selectedBank) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => setStep("bank")}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Send to Bank</h1>
        </header>

        <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
          {/* Selected Bank Display */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">
                {selectedBank.logo}
              </span>
            </div>
            <div className="flex flex-col flex-grow">
              <span className="text-white font-medium">{selectedBank.name}</span>
              <span className="text-gray-400 text-sm">Code: {selectedBank.code}</span>
            </div>
          </div>

          {/* Account Number Input */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter account number"
              maxLength={10}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
            {isVerifyingAccount && (
              <p className="text-blue-400 text-xs">Verifying account...</p>
            )}
            {accountName && !isVerifyingAccount && (
              <div className="bg-blue-500 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{accountName}</span>
                </div>
                <HiCheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
            )}
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
                        {recipient.accountNumber} • {recipient.bankName}
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

          {/* Continue Button */}
          <button
            onClick={handleAccountContinue}
            disabled={!selectedBank || accountNumber.length < 10 || !accountName}
            className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
              !selectedBank || accountNumber.length < 10 || !accountName
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

  // Bank Selection Step (Initial Step)
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Send to Bank</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Select Bank Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Bank
          </label>
          <div className="relative" ref={bankDropdownRef}>
            <button
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedBank ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {selectedBank.logo}
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {selectedBank.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">Select a bank</span>
                )}
              </div>
              {isBankDropdownOpen ? (
                <HiChevronDown className="w-5 h-5 text-white flex-shrink-0" />
              ) : (
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              )}
            </button>

            {isBankDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-96 overflow-y-auto">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {bank.logo}
                      </span>
                    </div>
                    <div className="flex flex-col items-start flex-grow">
                      <span className="text-white font-medium">{bank.name}</span>
                      <span className="text-gray-400 text-xs">Code: {bank.code}</span>
                    </div>
                    {selectedBank?.id === bank.id && (
                      <HiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Banks */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">Search Bank</label>
          <input
            type="text"
            placeholder="Search by bank name..."
            className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            onChange={(e) => {
              // Filter banks based on search (simplified - you can enhance this)
              const searchTerm = e.target.value.toLowerCase();
              // This is just a placeholder - you'd filter the banks array here
            }}
          />
        </div>

        {/* Recent Recipients (Quick Access) */}
        {recentRecipients.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-sm font-medium">Recent Recipients</h3>
            {recentRecipients.slice(0, 3).map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => {
                  handleRecipientSelect(recipient);
                  setStep("account");
                }}
                className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
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
                      {recipient.accountNumber} • {recipient.bankName}
                    </span>
                  </div>
                </div>
                <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleBankContinue}
          disabled={!selectedBank}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !selectedBank
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

