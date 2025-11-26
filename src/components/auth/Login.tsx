"use client";
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
// --- Types ---
type PhoneStepProps = {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onNext: () => void;
};

type PinStepProps = {
  pin: string;
  setPin: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

// --- Component 1: Phone Input Step ---
const PhoneInputStep: React.FC<PhoneStepProps> = ({
  phoneNumber,
  setPhoneNumber,
  onNext,
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F]  text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-blue-500 text-sm font-medium"
        >
          Sign Up
        </Link>
      </div>
      <div className="mb-10 space-y-2">
        <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
        <p className="text-gray-400 text-sm">
          Pick up right where you left off.
        </p>
      </div>

      {/* Form */}
      <div className="flex justify-between flex-col flex-1">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 block">
            Phone Number
          </label>
          <div className="flex items-center gap-3">
            {/* Country Selector */}
            <button className="flex items-center gap-2 bg-[#161616] border border-[#2B2F33] text-white px-3 py-3.5 rounded-xl min-w-[100px] hover:border-gray-600 transition-colors">
              <span className="text-lg">🇳🇬</span>
              <span className="text-sm font-medium">+234</span>
              <ChevronDown size={14} className="text-gray-400 ml-auto" />
            </button>

            {/* Phone Input */}
            <div className="flex-1 relative">
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="input phone number"
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
        <button
          onClick={onNext}
          disabled={!phoneNumber}
          className={`w-full py-4 rounded-full font-medium transition-all ${phoneNumber
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// --- Component 2: Pin Entry Step (Native Inputs) ---
const PinEntryStep: React.FC<PinStepProps> = ({
  pin,
  setPin,
  onConfirm,
  onBack,
}) => {
  const [codes, setCodes] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync parent pin state with local codes if needed, or initialize
  useEffect(() => {
    if (pin.length === 4 && codes.join("") !== pin) {
      const newCodes = pin.split("");
      setCodes(newCodes);
    } else if (pin === "" && codes.some((c) => c !== "")) {
      setCodes(["", "", "", ""]);
    }
  }, [pin]);

  // --- HANDLE CHANGE ---
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    setPin(newCodes.join(""));

    // Auto-focus next input
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

  // --- HANDLE PASTE ---
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .slice(0, 4)
      .replace(/\D/g, "");
    if (!pasted) return;

    const newCodes = ["", "", "", ""];
    pasted.split("").forEach((char, i) => {
      newCodes[i] = char;
    });

    setCodes(newCodes);
    setPin(newCodes.join(""));

    const nextIndex = Math.min(pasted.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6 items-center">
      {/* Back Button & Header - Optional based on design, adding back capability */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F]  text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />  
        </button>
        <h1 className="text-2xl font-semibold text-center">Input Pin</h1>
        <Link
          href="/auth/sign-up"
          className="text-blue-500 text-sm font-medium"
        >
          Sign Up
        </Link>
      </div>

      {/* Pin Input Fields */}
      <div className="flex justify-center gap-4 mb-8">
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
              const val = e.target.value.replace(/\D/g, ""); // allow only numbers
              handleChange(i, val);
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all
                ${digit
                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              }
            `}
          />
        ))}
      </div>

      <Link href='/auth/forget-password' className="text-blue-500 text-left text-sm font-medium mb-12 hover:text-blue-400">
        Forgot Password?
      </Link>

      {/* Confirm Button */}
      <div className="mt-auto mb-6 w-full">
        <button
          onClick={onConfirm}
          disabled={pin.length < 4}
          className={`w-full py-4 rounded-full font-medium transition-all ${pin.length === 4
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
            }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

// --- Main Page / Orchestrator ---
export default function Login() {
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");

  const handlePhoneSubmit = () => {
    // In a real app, you would validate or send OTP here
    setStep("pin");
  };

  const handlePinSubmit = () => {
    // Handle login logic
    alert(`Logging in with: \nPhone: ${phoneNumber}\nPin: ${pin}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      {step === "phone" ? (
        <PhoneInputStep
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onNext={handlePhoneSubmit}
        />
      ) : (
        <PinEntryStep
          pin={pin}
          setPin={setPin}
          onConfirm={handlePinSubmit}
          onBack={() => setStep("phone")}
        />
      )}
    </div>
  );
}
