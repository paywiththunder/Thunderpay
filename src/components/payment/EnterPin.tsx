"use client";
import React, { useState, useRef } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

interface EnterPinProps {
  onBack: () => void;
  onComplete: (pin: string) => void;
}

export default function EnterPin({ onBack, onComplete }: EnterPinProps) {
  const [codes, setCodes] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]?$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (newCodes.every((code) => code !== "") && index === 3) {
      setTimeout(() => {
        onComplete(newCodes.join(""));
      }, 100);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
        <h1 className="text-2xl font-bold text-white">Enter Pin</h1>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
        {/* PIN Input Fields */}
        <div className="flex justify-center gap-4">
          {codes.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange(i, val);
              }}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${
                digit
                  ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                  : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

