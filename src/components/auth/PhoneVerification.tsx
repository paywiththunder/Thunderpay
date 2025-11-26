"use client";
import { useState, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

export default function PhoneVerification() {
  const [codes, setCodes] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 4);
    const newCodes = [...codes];

    pasted.split("").forEach((char, i) => {
      if (i < 4) newCodes[i] = char;
    });

    setCodes(newCodes);
    inputRefs.current[Math.min(pasted.length - 1, 3)]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex items-start justify-center p-6">
      <div className="w-full max-w-md">
        {/* Top navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft />
          </Link>

          <Link
            href="/auth/login"
            className="text-blue-500 text-sm font-medium"
          >
            Sign In
          </Link>
        </div>

        <h2 className="text-2xl font-semibold my-2">
          Verify your Phone Number
        </h2>
        <p className="text-sm text-[#98A0A8] mb-6">
          We've sent a 4-digit code to your phone — enter it to complete
          verification.
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-4 mb-4">
          {codes.map((code, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={code}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-14 h-16 text-center text-2xl font-medium rounded-lg border border-[#2B2F33] bg-[#0f1112] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <p className="text-sm text-[#98A0A8] mb-6">
          Didn't get a code? <button className="text-[#3EA6FF]">Resend</button>
        </p>

        {/* Submit */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium mt-4 transition">
          Verify
        </button>
      </div>
    </div>
  );
}
