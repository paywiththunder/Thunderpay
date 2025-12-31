"use client";
import React from "react";
import { HiCheckCircle, HiOutlineInformationCircle } from "react-icons/hi2";

interface PaymentSuccessProps {
  title?: string;
  amount: string; // e.g., "0.0060 SOL"
  amountEquivalent: string; // e.g., "≈ ₦20,000.00"
  token: string;
  biller: string;
  billerLabel?: string;
  meterNumber: string;
  meterNumberLabel?: string;
  customerName: string;
  customerNameLabel?: string;
  meterType: string;
  meterTypeLabel?: string;
  serviceAddress: string;
  unitsPurchased?: string;
  paymentMethod: string;
  bonusEarned: string;
  transactionDate: string;
  onAddToBeneficiary: () => void;
  onContinue: () => void;
}

export default function PaymentSuccess({
  title = "Electricity Bill Paid Successfully",
  amount,
  amountEquivalent,
  token,
  biller,
  billerLabel = "Biller",
  meterNumber,
  meterNumberLabel = "Meter Number",
  customerName,
  customerNameLabel = "Customer Name",
  meterType,
  meterTypeLabel = "Meter Type",
  serviceAddress,
  unitsPurchased,
  paymentMethod,
  bonusEarned,
  transactionDate,
  onAddToBeneficiary,
  onContinue,
}: PaymentSuccessProps) {
  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
          <HiCheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          {title}
        </h1>

        {/* Receipt Header */}
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Receipt</span>
            <button className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-400 transition-colors">
              Download
              <HiOutlineInformationCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Display */}
          <div className="flex flex-col items-center gap-2 py-4 mb-4">
            <h2 className="text-3xl font-bold text-white">{amount}</h2>
            <p className="text-gray-400 text-sm">{amountEquivalent}</p>
          </div>

          {/* Transaction Details */}
          <div className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 rounded-2xl p-4 flex flex-col gap-3 mb-4">
            <DetailRow label="Token" value={token} />
            <DetailRow label={billerLabel} value={biller} />
            <DetailRow label={meterNumberLabel} value={meterNumber} />
            <DetailRow label={customerNameLabel} value={customerName} />
            <DetailRow label={meterTypeLabel} value={meterType} />
            <DetailRow label="Service Address" value={serviceAddress} />
            {unitsPurchased && (
              <DetailRow label="Units Purchased" value={unitsPurchased} />
            )}
            <DetailRow label="Payment Method" value={paymentMethod} />
            <DetailRow label="Bonus Earned" value={bonusEarned} />
            <DetailRow label="Transaction Date" value={transactionDate} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onAddToBeneficiary}
              className="w-full py-4 rounded-full font-bold text-white bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 transition-colors"
            >
              Add to Beneficiary
            </button>
            <button
              onClick={onContinue}
              className="w-full py-4 rounded-full font-bold text-white bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
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

