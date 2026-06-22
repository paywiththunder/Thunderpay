"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight, HiChevronDown } from "react-icons/hi2";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

interface Bank {
  id: string;
  name: string;
  code: string;
  logo: string;
}

const banks: Bank[] = [
  { id: "access", name: "Access Bank", code: "044", logo: "A" },
  { id: "gtb", name: "Guaranty Trust Bank", code: "058", logo: "G" },
  { id: "firstbank", name: "First Bank of Nigeria", code: "011", logo: "F" },
  { id: "uba", name: "United Bank for Africa", code: "033", logo: "U" },
  { id: "zenith", name: "Zenith Bank", code: "057", logo: "Z" },
  { id: "fidelity", name: "Fidelity Bank", code: "070", logo: "F" },
];

type TabType = "card" | "account";

export default function TopUpPage() {
  const router = useRouter();
  const bankDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [pin, setPin] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleConfirm = () => {
    // TODO: Implement confirm functionality
    console.log("Confirm top-up", { activeTab, cardNumber, expiryDate, cvv, pin, accountNumber, selectedBank });
  };

  const isFormValid = () => {
    if (activeTab === "card") {
      return cardNumber.length >= 19 && expiryDate.length === 7 && cvv.length >= 3 && pin.length >= 4;
    } else {
      return accountNumber.length >= 10 && selectedBank !== null;
    }
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Top-up with Card/Account</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Tabs */}
        <div className="flex items-center gap-0 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "card"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Bank Card
          </button>
          <div className="w-px bg-white/20"></div>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "account"
                ? "bg-gray-700 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Bank Account
          </button>
        </div>

        {/* Card Tab Content */}
        {activeTab === "card" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="enter 16-19 digits card number"
                maxLength={19}
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM / YY"
                maxLength={7}
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="enter card CVV"
                maxLength={3}
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="enter card pin"
                maxLength={6}
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        )}

        {/* Account Tab Content */}
        {activeTab === "account" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Thunder Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="enter amount"
                className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white placeholder-gray-500 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Select Bank</label>
              <div className="relative" ref={bankDropdownRef}>
                <button
                  onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                  className="w-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {selectedBank ? (
                      <>
                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{selectedBank.name}</span>
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => {
                          setSelectedBank(bank);
                          setIsBankDropdownOpen(false);
                        }}
                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{bank.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!isFormValid()}
          className={`w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 ${
            !isFormValid()
              ? "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
              : ""
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

