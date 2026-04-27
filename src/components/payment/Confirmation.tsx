"use client";
import React, { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

interface QuoteDetails {
  label: string;
  value: string;
}

interface ConfirmationProps {
  onBack: () => void;
  onPay: () => void; // This will trigger PIN entry
  amount: number;
  paymentAmount: string; // e.g., "0.0060 SOL"
  // Legacy props (optional for backward compatibility)
  paymentMethod?: string;
  biller?: string;
  billerLabel?: string;
  meterNumber?: string;
  meterNumberLabel?: string;
  customerName?: string;
  customerNameLabel?: string;
  meterType?: string;
  meterTypeLabel?: string;
  serviceAddress?: string;
  cashback?: number;
  availableBalance: string;
  boltBalance?: number;
  recipientAmount?: string; // e.g., "₦5,000"
  // New dynamic props
  details?: QuoteDetails[];
}

export default function Confirmation({
  onBack,
  onPay,
  amount,
  paymentAmount,
  paymentMethod,
  biller,
  billerLabel = "Biller",
  meterNumber,
  meterNumberLabel = "Meter Number",
  customerName,
  customerNameLabel = "Customer Name",
  meterType,
  meterTypeLabel = "Meter Type",
  serviceAddress,
  cashback,
  availableBalance,
  boltBalance,
  recipientAmount,
  details,
}: ConfirmationProps) {
  const [useCashback, setUseCashback] = useState(false);

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
          <p className="text-gray-400 text-sm">
            {recipientAmount || `≈ ₦${amount.toLocaleString()}.00`}
          </p>
        </div>

        {/* Payment Details */}
        <div className="flex flex-col gap-4">
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col gap-3">
            {details ? (
              details.map((item, index) => (
                <DetailRow key={index} label={item.label} value={item.value} />
              ))
            ) : (
              <>
                {biller && <DetailRow label={billerLabel} value={biller} />}
                {meterNumber && <DetailRow label={meterNumberLabel} value={meterNumber} />}
                {customerName && <DetailRow label={customerNameLabel} value={customerName} />}
                {meterType && <DetailRow label={meterTypeLabel} value={meterType} />}
                {serviceAddress && <DetailRow label="Service Address" value={serviceAddress} />}
                {paymentMethod && <DetailRow label="Payment Method" value={paymentMethod} />}
                {cashback !== undefined && <DetailRow label="Bolt to Earn" value={`${cashback.toFixed(2)} bolts`} />}
              </>
            )}
          </div>

          {/* Bolt Balance Display */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-medium">
                Bolt Balance
              </span>
              <span className="text-gray-400 text-sm mt-1">
                {boltBalance?.toLocaleString() || "0.00"} Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-xs font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-md">
                Thunder Bolts
              </span>
            </div>
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
