"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiCheckCircle, HiChevronRight, HiChevronDown } from "react-icons/hi2";
import PaymentMethod, {
  PaymentOption,
} from "@/components/payment/PaymentMethod";
import Confirmation from "@/components/payment/Confirmation";
import EnterPin from "@/components/payment/EnterPin";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";
import { getCryptoToNgnQuote, executeTransfer, verifyAccountNumber, getBanksList, BankItem } from "@/services/transfer";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

interface RecentRecipient {
  id: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  bankCode?: string;
  initial?: string;
}

interface Bank {
  id: string;
  name: string;
  code: string;
  logo: string;
}

const amountOptions = [
  { amount: 1000 },
  { amount: 2000 },
  { amount: 5000 },
  { amount: 10000 },
  { amount: 20000 },
  { amount: 50000 },
];

const recentRecipients: RecentRecipient[] = [];

type Step = "bank" | "account" | "amount" | "payment" | "confirmation" | "enterPin" | "result";
type TransactionResult = "success" | "failure" | null;
type TabType = "recents" | "beneficiaries";

export default function SendCryptoToCashPage() {
  const router = useRouter();
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("bank");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<RecentRecipient | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentOption | null>(null);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [transactionToken, setTransactionToken] = useState("");
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [failureReason, setFailureReason] = useState<string>("");

  // Fetch banks list
  const { data: banksData, isLoading: banksLoading, error: banksError } = useQuery<BankItem[]>({
    queryKey: ["banksList"],
    queryFn: getBanksList,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const banks: Bank[] = (banksData ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    logo: b.name.charAt(0).toUpperCase(),
  }));

  const filteredBanks = bankSearch.trim()
    ? banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : banks;

  // Filter recipients based on selected bank and account number
  const filteredRecipients = recentRecipients.filter((recipient) => {
    const matchesBank = !selectedBank || recipient.bankCode === selectedBank.code;
    const matchesAccount = accountNumber.length === 0 || recipient.accountNumber.includes(accountNumber);
    return matchesBank && matchesAccount;
  });

  // Auto-verify account number when bank and account number are provided
  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      setIsVerifyingAccount(true);
      setVerificationError("");
      setAccountName("");

      // Check if it's a recent recipient first
      const match = recentRecipients.find(
        (r) => r.accountNumber === accountNumber && r.bankCode === selectedBank.code
      );

      if (match) {
        setAccountName(match.name);
        setSelectedRecipient(match);
        setIsVerifyingAccount(false);
      } else {
        // Call API to verify account
        verifyAccountNumber({ bankId: selectedBank.id, accountNumber })
          .then((name) => {
            setAccountName(name);
            setSelectedRecipient(null);
            setVerificationError("");
          })
          .catch((error: any) => {
            const errorMsg = error?.description || error?.message || "Unable to verify account";
            setVerificationError(errorMsg);
            setAccountName("");
            toast.error(errorMsg);
          })
          .finally(() => {
            setIsVerifyingAccount(false);
          });
      }
    } else {
      setAccountName("");
      setSelectedRecipient(null);
      setVerificationError("");
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
    setBankSearch("");
    // Clear account details when bank changes
    setAccountNumber("");
    setAccountName("");
    setVerificationError("");
    setSelectedRecipient(null);
  };

  const handleRecipientSelect = (recipient: RecentRecipient) => {
    setSelectedRecipient(recipient);
    setAccountNumber(recipient.accountNumber);
    setAccountName(recipient.name);
    const bank = banks.find((b) => b.code === recipient.bankCode);
    if (bank) {
      setSelectedBank(bank);
    }
  };

  const generateTransactionToken = (): string => {
    const segments = Array.from({ length: 5 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString()
    );
    return segments.join("-");
  };

  const getCashback = (): number => {
    return 0;
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

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleBankContinue = () => {
    if (selectedBank) {
      setStep("account");
    }
  };

  const handleAccountContinue = () => {
    if (selectedBank && accountNumber.length === 10 && accountName && !verificationError) {
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

  const handlePaymentMethodSelect = async (paymentMethod: PaymentOption) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsQuoting(true);
    setStep("confirmation");

    if (!paymentMethod.network || !paymentMethod.walletId) {
      const errorMsg = "Payment method is missing network or wallet information.";
      console.error("❌", errorMsg, paymentMethod);
      toast.error(errorMsg);
      return;
    }

    const payload = {
      walletId: paymentMethod.walletId,
      network: paymentMethod.network,
      sourceAmount: parseFloat(amount),
      scope: "EXTERNAL_BANK" as const,
      recipientAccountNumber: accountNumber,
    };
    console.log("CLICKED PAYLOAD:", payload);

    // console.log(" ===== CRYPTO TO CASH TRANSFER INITIATED =====");
    // console.log("🔍 Payment Method Selected:");
    // console.log("  - Name:", paymentMethod.name);
    // console.log("  - Currency Code:", paymentMethod.currencyCode);
    // console.log("  - Network:", paymentMethod.network);
    // console.log("  - Wallet ID:", paymentMethod.walletId);
    // console.log("  - Type:", paymentMethod.type);
    // console.log("  - Balance:", paymentMethod.balance);
    // console.log("  - Full Payment Method Object:", JSON.stringify(paymentMethod, null, 2));

    try {


      console.log("📤 ===== CRYPTO TO CASH QUOTE REQUEST PAYLOAD =====");
      console.log("📤 API Endpoint: /transfers/crypto-ngn/quote");
      console.log("📤 Request Method: POST");
      console.log("📤 Payload Details:");
      console.log("  - walletId:", payload.walletId, "(type:", typeof payload.walletId, ")");
      console.log("  - network:", payload.network, "(type:", typeof payload.network, ")");
      console.log("  - sourceAmount:", payload.sourceAmount, "(type:", typeof payload.sourceAmount, ")");
      console.log("  - scope:", payload.scope, "(type:", typeof payload.scope, ")");
      console.log("  - recipientAccountNumber:", payload.recipientAccountNumber, "(type:", typeof payload.recipientAccountNumber, ")");
      console.log("📤 Full JSON Payload:", JSON.stringify(payload, null, 2));

      console.log("🏦 ===== RECIPIENT & TRANSACTION DETAILS =====");
      console.log("  - Account Number:", accountNumber);
      console.log("  - Account Name:", accountName);
      console.log("  - Selected Bank Name:", selectedBank?.name);
      console.log("  - Selected Bank Code:", selectedBank?.code);
      console.log("  - Selected Bank ID:", selectedBank?.id);
      console.log("  - Amount (NGN):", amount);
      console.log("  - Amount (parsed):", parseFloat(amount));
      console.log("  - Timestamp:", new Date().toISOString());

      const response = await getCryptoToNgnQuote(payload);
      console.log("QUOTE API RESPONSE:", response);

      console.log("📥 ===== CRYPTO TO CASH QUOTE RESPONSE =====");
      console.log("  - Success:", response.success);
      console.log("  - Description:", response.description);
      console.log("  - Response Timestamp:", new Date().toISOString());
      console.log("📥 Full Response Object:", JSON.stringify(response, null, 2));

      if (response.success) {
        console.log("✅ ===== QUOTE SUCCESSFUL - DETAILED BREAKDOWN =====");
        console.log("  - Quote Reference:", response.data.quoteReference);
        console.log("  - Exchange Rate:", response.data.rate);
        console.log("  - Source Amount:", response.data.sourceAmount, response.data.sourceCurrency);
        console.log("  - Estimated Payout:", response.data.estimatedPayoutNgn, "NGN");
        console.log("  - Platform Fee:", response.data.platformFeeNgn, "NGN");
        console.log("  - Quote Expires At:", response.data.expiresAt);
        console.log("✅ Quote Data Set Successfully");

        setQuote(response.data);
      } else {
        const errorMsg = response.description || "Failed to get quote";
        console.error("❌ ===== QUOTE FAILED =====");
        console.error("❌ Error Message:", errorMsg);
        console.error("❌ Full Error Response:", JSON.stringify(response, null, 2));
        toast.error(errorMsg);
        setStep("payment");
      }
    } catch (error: any) {
      console.error("❌ ===== QUOTE REQUEST EXCEPTION =====");
      console.error("❌ Error Type:", error.constructor.name);
      console.error("❌ Error Message:", error?.message);
      console.error("❌ Error Description:", error?.description);
      console.error("❌ HTTP Status:", error?.status);
      console.error("❌ Response Data:", error?.response?.data);
      console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
      const errorMsg = error?.description || error?.message || "Error fetching quote";
      toast.error(errorMsg);
      setStep("payment");
    } finally {
      setIsQuoting(false);
      console.log("🏁 ===== CRYPTO TO CASH QUOTE REQUEST COMPLETED =====");
    }
  };

  const handlePinComplete = async (pin: string) => {
    if (!quote) return;

    try {
      const payload = {
        quoteReference: quote.quoteReference,
        recipientIdentifier: accountNumber,
        pin: pin,
      };

      const response = await executeTransfer(payload);
      if (response.success) {
        setTransactionToken(response.data?.transactionReference || generateTransactionToken());
        setTransactionResult("success");
      } else {
        const errorMsg = response.description || "Transfer failed";
        toast.error(errorMsg);
        setFailureReason(errorMsg);
        setTransactionResult("failure");
      }
    } catch (error: any) {
      console.error("Transfer error:", error);
      const errorMsg = error.description || error.message || "Transaction failed";
      toast.error(errorMsg);
      setFailureReason(errorMsg);
      setTransactionResult("failure");
    }
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
        walletType="crypto"
      />
    );
  }

  // Confirmation Step
  if (step === "confirmation" && selectedPaymentMethod) {
    return (
      <Confirmation
        onBack={() => setStep("payment")}
        onPay={() => setStep("enterPin")}
        amount={parseFloat(amount) || 0}
        paymentAmount={quote ? `${(quote.sourceAmount ?? 0).toLocaleString()} ${selectedPaymentMethod.currencyCode || ""}` : "Calculating..."}
        paymentMethod={`Crypto (${selectedPaymentMethod.name})`}
        biller="Thunder Cash Account"
        billerLabel="Service"
        meterNumber={accountNumber}
        meterNumberLabel="Account Number"
        customerName={accountName}
        customerNameLabel="Account Name"
        meterType="Cash Transfer"
        meterTypeLabel="Transfer Type"
        serviceAddress=""
        cashback={getCashback()}
        availableBalance={selectedPaymentMethod.balance || "0.00"}
        recipientAmount={quote ? `₦${(quote.estimatedPayoutNgn ?? 0).toLocaleString()}` : undefined}
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
  if (step === "result" && selectedPaymentMethod) {
    const paymentAmount = quote ? `${(quote.sourceAmount ?? 0).toLocaleString()} ${selectedPaymentMethod.currencyCode || ""}` : "0";
    const amountNum = parseFloat(amount) || 0;
    const amountEquivalent = quote ? `≈ ₦${(quote.estimatedPayoutNgn ?? 0).toLocaleString()}` : `≈ ₦${amountNum.toLocaleString()}.00`;
    const transactionDate = getTransactionDate();

    if (transactionResult === "success") {
      return (
        <PaymentSuccess
          title="Transfer Successful"
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          token={transactionToken}
          biller="Thunder Cash Account"
          billerLabel="Service"
          meterNumber={accountNumber}
          meterNumberLabel="Account Number"
          customerName={accountName}
          customerNameLabel="Account Name"
          meterType="Cash Transfer"
          meterTypeLabel="Transfer Type"
          serviceAddress=""
          paymentMethod={selectedPaymentMethod.name}
          bonusEarned={`₦${getCashback().toFixed(2)} Cashback`}
          transactionDate={transactionDate}
          onAddToBeneficiary={handleAddToBeneficiary}
          onContinue={handleContinueFromResult}
        />
      );
    } else if (transactionResult === "failure") {
      return (
        <PaymentFailure
          amount={paymentAmount}
          amountEquivalent={amountEquivalent}
          failureReason={failureReason || "Transaction failed"}
          biller="Thunder Cash Account"
          billerLabel="Service"
          meterNumber={accountNumber}
          meterNumberLabel="Account Number"
          customerName={accountName}
          customerNameLabel="Account Name"
          meterType="Cash Transfer"
          meterTypeLabel="Transfer Type"
          serviceAddress=""
          paymentMethod={selectedPaymentMethod.name}
          transactionDate={transactionDate}
          onContinue={handleContinueFromResult}
        />
      );
    }
  }

  // Amount Entry Step
  if (step === "amount") {
    return (
      <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
        <header className="relative flex items-center justify-center px-4 py-6">
          <button
            onClick={() => setStep("account")}
            className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Crypto to Cash</h1>
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
                {accountNumber} • Thunder Cash
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
                className={`bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-800/50 transition-colors ${amount === option.amount.toString()
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : ""
                  }`}
              >
                <span className="text-white font-bold text-base">
                  ₦{option.amount.toLocaleString()}
                </span>
                <span className="text-gray-400 text-xs mt-1">
                  ₦0 Cashback
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
            className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!amount
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
          <h1 className="text-2xl font-bold text-white">Crypto to Cash</h1>
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
            {verificationError && !isVerifyingAccount && (
              <p className="text-red-400 text-xs">{verificationError}</p>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleAccountContinue}
            disabled={!selectedBank || accountNumber.length < 10 || !accountName || isVerifyingAccount || !!verificationError}
            className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!selectedBank || accountNumber.length < 10 || !accountName || isVerifyingAccount || !!verificationError
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
        <h1 className="text-2xl font-bold text-white">Crypto to Cash</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Select Bank Section */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Select Bank
          </label>

          <div className="relative" ref={bankDropdownRef}>
            {/* Trigger button */}
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

            {/* Dropdown: search + scrollable list */}
            {isBankDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/20 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden">
                {/* Sticky search input inside dropdown */}
                <div className="p-3 border-b border-white/10 sticky top-0 bg-[#111] z-10">
                  <input
                    autoFocus
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Search banks..."
                    className="w-full bg-[#1c1c1c] border border-white/10 text-white placeholder-gray-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Scrollable bank list */}
                <div className="max-h-56 overflow-y-auto">
                  {banksLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    </div>
                  ) : banksError ? (
                    <p className="text-red-400 text-sm text-center py-4">Failed to load banks</p>
                  ) : filteredBanks.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No banks found</p>
                  ) : (
                    filteredBanks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => handleBankSelect(bank)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors"
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
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleBankContinue}
          disabled={!selectedBank}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${!selectedBank
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
