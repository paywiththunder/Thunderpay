"use client";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import { useRef } from "react";

export default function ConfirmPinStep({
  confirmPin,
  setConfirmPin,
  onConfirm,
  onPrev,
}: {
  confirmPin: string;
  setConfirmPin: (value: string) => void;
  onConfirm: () => void;
  onPrev: () => void;
}) {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    let newPin = confirmPin.split("");

    newPin[index] = value;
    const updatedPin = newPin.join("").slice(0, 4);

    setConfirmPin(updatedPin);

    // Move to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleBackspace = (index: number, value: string) => {
    if (value === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="h-full w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 w-full">
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold text-center">Confirm Pin</h1>

        <Link href="/auth/login" className="text-blue-500 text-sm font-medium">
          Sign In
        </Link>
      </div>

      {/* PIN Boxes */}
      <div className="flex justify-center gap-4 my-20">
        {Array.from({ length: 4 }).map((_, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="password"
            maxLength={1}
            value={confirmPin[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                handleBackspace(index, confirmPin[index] || "");
              }
            }}
            className="w-14 h-14 text-center text-2xl font-medium rounded-lg border border-[#2B2F33] bg-[#0f1112] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      {/* Button */}
      <button
        disabled={confirmPin.length < 4}
        onClick={onConfirm}
        className="w-11/12 py-3 md:w-1/2 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
      >
        Confirm PIN
      </button>
    </div>
  );
}
