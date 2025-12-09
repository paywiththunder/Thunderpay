"use client";
import React, { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

interface ConfirmationProps {
  onBack: () => void;
  onPay: () => void; // This will trigger PIN entry
  amount: number;
  paymentAmount: string; // e.g., "0.0060 SOL"
  paymentMethod: string; // e.g., "Crypto (Solana)"
  biller: string;
  meterNumber: string;
  customerName: string;
  meterType: string;
  serviceAddress: string;
  cashback: number;
  availableBalance: string;
}

export default function Confirmation({
  onBack,
  onPay,
  amount,
  paymentAmount,
  paymentMethod,
  biller,
  meterNumber,
  customerName,
  meterType,
  serviceAddress,
  cashback,
  availableBalance,
}: ConfirmationProps) {
  const [useCashback, setUseCashback] = useState(false);
  const cashbackBalance = 500;

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={onBack}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Confirmation</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto pb-6">
        {/* Amount Display */}
        <div className="flex flex-col items-center gap-2 py-4">
          <h2 className="text-3xl font-bold text-white">{paymentAmount}</h2>
          <p className="text-gray-400 text-sm">≈ ₦{amount.toLocaleString()}.00</p>
        </div>

        {/* Payment Details */}
        <div className="flex flex-col gap-4">
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col gap-3">
            <DetailRow label="Biller" value={biller} />
            <DetailRow label="Meter Number" value={meterNumber} />
            <DetailRow label="Customer Name" value={customerName} />
            <DetailRow label="Meter Type" value={meterType} />
            <DetailRow label="Service Address" value={serviceAddress} />
            <DetailRow label="Payment Method" value={paymentMethod} />
            <DetailRow label="Bonus to Earn" value={`₦${cashback.toFixed(2)} Cashback`} />
          </div>

          {/* Use Cashback Toggle */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-medium">
                Use Cashback (₦{cashbackBalance.toLocaleString()}.00)
              </span>
              {useCashback && (
                <span className="text-gray-400 text-sm mt-1">
                  -₦{cashbackBalance.toLocaleString()}.00
                </span>
              )}
            </div>
            <button
              onClick={() => setUseCashback(!useCashback)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useCashback ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  useCashback ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Available Balance */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4">
            <DetailRow label="Available Balance" value={availableBalance} />
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={onPay}
          className="w-full py-4 rounded-full font-bold text-white transition-all mt-4 mb-20 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50"
        >
          Pay
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

