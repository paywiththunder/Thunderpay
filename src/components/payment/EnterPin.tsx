"use client";
import React, { useState, useRef, useEffect } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";

interface EnterPinProps {
  onBack: () => void;
  onComplete: (pin: string) => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function EnterPin({ onBack, onComplete, isLoading = false, error }: EnterPinProps) {
  const [codes, setCodes] = useState(["", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Submission is tracked here as well as via `isLoading` because most flows
  // never pass that prop. Without a local guard, editing a digit while the
  // payment is in flight re-runs auto-submit and charges the user twice.
  const busy = isLoading || submitting;

  // A rejected PIN leaves the user on this screen, so let them try again.
  useEffect(() => {
    if (error) setSubmitting(false);
  }, [error]);

  const submit = async (pin: string) => {
    setSubmitting(true);
    try {
      await onComplete(pin);
    } finally {
      // A no-op once the flow has moved on and unmounted this screen; it only
      // matters when the handler bailed out early and left us mounted.
      setSubmitting(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (busy) return;
    if (value.length > 1) return;
    if (!/^[0-9]?$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // Auto-advance
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (newCodes.every((code) => code !== "") && index === 3) {
      void submit(newCodes.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (busy) return;
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
          disabled={busy}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 disabled:opacity-50"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Enter Pin</h1>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
        {/* PIN Input Fields */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex justify-center gap-4">
            {codes.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                disabled={busy}
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
                className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${error
                  ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                  : digit
                    ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                    : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  } ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium animate-pulse">
              {error}
            </p>
          )}

          {busy && (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-blue-500 text-sm font-medium">Processing Payment...</p>
            </div>
          )}

          {!busy && !error && (
            <Link
              href="/profile/reset-pin"
              className="text-blue-500 text-sm font-medium hover:text-blue-400"
            >
              Forgot PIN?
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

