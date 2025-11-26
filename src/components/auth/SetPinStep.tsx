"use client";
import { useRef, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

export default function SetPinStep({
  pin,
  setPin,
  onNext,
  onPrev,
}: {
  pin: string;
  setPin: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [codes, setCodes] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- HANDLE CHANGE ---
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    setPin(newCodes.join(""));

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // --- HANDLE BACKSPACE ---
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- HANDLE PASTE (4 digits) ---
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    const newCodes = ["", "", "", ""];

    pasted.split("").forEach((char, i) => {
      newCodes[i] = char;
    });

    setCodes(newCodes);
    setPin(newCodes.join(""));

    inputRefs.current[Math.min(pasted.length - 1, 3)]?.focus();
  };

  return (
    <div className=" w-full h-full">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between mb-6 w-full">
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold text-center">Set Pin</h1>

        <Link href="/auth/login" className="text-blue-500 text-sm font-medium">
          Sign In
        </Link>
      </div>

      {/* PIN INPUTS */}
      <div className="flex justify-center gap-4 my-20">
        {codes.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="password" // <— hides the digit
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, ""); // allow only numbers
              handleChange(i, val);
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-14 h-14 text-center text-2xl font-medium rounded-lg border border-[#2B2F33] bg-[#0f1112] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      {/* CONTINUE BUTTON */}
      <button
        disabled={pin.length < 4}
        onClick={onNext}
        className="w-11/12 py-3 md:w-1/2 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
      >
        Continue
      </button>
    </div>
  );
}
