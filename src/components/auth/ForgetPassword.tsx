"use client";
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import Ready from '../../../public/ready.png'

type Step = "phone" | "verify" | "setPin" | "confirmPin" | "success";

// --- Step 1: Phone Input ---
const PhoneStep = ({
  phoneNumber,
  setPhoneNumber,
  onNext,
}: {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onNext: () => void;
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/auth/login"
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </Link>
        <Link href="/auth/sign-up" className="text-blue-500 text-sm font-medium">
          Sign Up
        </Link>
      </div>

      <div className="mb-10 space-y-2">
        <h1 className="text-2xl font-bold text-white">
          No worries — let's
          <br />
          help you get back in.
        </h1>
        <p className="text-gray-400 text-sm">
          Enter your phone number or email to
          <br />
          reset your PIN.
        </p>
      </div>

      {/* Form */}
      <div className="flex justify-between flex-col flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 block">
              Phone Number
            </label>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#161616] border border-[#2B2F33] text-white px-3 py-3.5 rounded-xl min-w-[100px] hover:border-gray-600 transition-colors">
                <span className="text-lg">🇳🇬</span>
                <span className="text-sm font-medium">+234</span>
                <ChevronDown size={14} className="text-gray-400 ml-auto" />
              </button>

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

          <Link href="#" className="text-blue-500 text-sm font-medium block">
            Use email instead
          </Link>
        </div>

        <button
          onClick={onNext}
          disabled={!phoneNumber}
          className={`w-full py-4 rounded-full font-medium transition-all ${
            phoneNumber
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

// --- Step 2: Verify Code ---
const VerifyStep = ({
  codes,
  setCodes,
  onNext,
  onPrev,
}: {
  codes: string[];
  setCodes: (codes: string[]) => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const val = value.replace(/\D/g, "");

    const newCodes = [...codes];
    newCodes[index] = val;
    setCodes(newCodes);

    if (val && index < 3) {
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
    const pasted = e.clipboardData.getData("text").slice(0, 4).replace(/\D/g, "");
    const newCodes = ["", "", "", ""];
    pasted.split("").forEach((char, i) => {
      newCodes[i] = char;
    });
    setCodes(newCodes);
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const isComplete = codes.every((c) => c !== "");

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>
        <Link href="/auth/sign-up" className="text-blue-500 text-sm font-medium">
          Sign Up
        </Link>
      </div>

      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold text-white">Confirm it's really you</h1>
        <p className="text-gray-400 text-sm">
          We've sent a 4-digit code to your phone,
          <br />
          enter it to complete verification.
        </p>
      </div>

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
            className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all ${
              code
                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Didn't get a code?{" "}
        <button className="text-blue-500 font-medium">Resend</button>
      </p>

      <div className="flex-1 flex flex-col justify-end">
        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`w-full py-4 rounded-full font-medium transition-all ${
            isComplete
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

// --- Step 3: Set Pin ---
const SetPinStepComponent = ({
  pin,
  setPin,
  onNext,
  onPrev,
}: {
  pin: string;
  setPin: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const codes = pin.split("").concat(Array(4 - pin.length).fill(""));

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const val = value.replace(/\D/g, "");

    const newCodes = [...codes];
    newCodes[index] = val;
    setPin(newCodes.join(""));

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>
        <h1 className="text-2xl font-semibold text-center">Set Pin</h1>
        <Link href="/auth/sign-up" className="text-blue-500 text-sm font-medium">
          Sign Up
        </Link>
      </div>

      {/* PIN Inputs */}
      <div className="flex justify-center gap-4 my-8">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={codes[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all ${
              codes[i]
                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <button
          onClick={onNext}
          disabled={pin.length < 4}
          className={`w-full py-4 rounded-full font-medium transition-all ${
            pin.length === 4
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

// --- Step 4: Confirm Pin ---
const ConfirmPinStepComponent = ({
  confirmPin,
  setConfirmPin,
  onConfirm,
  onPrev,
}: {
  confirmPin: string;
  setConfirmPin: (value: string) => void;
  onConfirm: () => void;
  onPrev: () => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const codes = confirmPin.split("").concat(Array(4 - confirmPin.length).fill(""));

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const val = value.replace(/\D/g, "");

    const newCodes = [...codes];
    newCodes[index] = val;
    setConfirmPin(newCodes.join(""));

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>
        <h1 className="text-2xl font-semibold text-center">Confirm Pin</h1>
        <Link href="/auth/sign-up" className="text-blue-500 text-sm font-medium">
          Sign Up
        </Link>
      </div>

      {/* PIN Inputs */}
      <div className="flex justify-center gap-4 my-8">
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={codes[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all ${
              codes[i]
                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <button
          onClick={onConfirm}
          disabled={confirmPin.length < 4}
          className={`w-full py-4 rounded-full font-medium transition-all ${
            confirmPin.length === 4
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

// --- Step 5: Success ---
const SuccessStep = () => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6 items-center justify-center">
      {/* Success Icon */}
      <div className="relative mb-8">
        {/* Decorative lines */}
        <div className="mb-10">
          <Image width={100} height={100} src={Ready} alt="Ready" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
      <p className="text-gray-400 text-sm text-center mb-8">
        Your password has been updated securely.
        <br />
        You can now sign in to your account.
      </p>

      <div className="w-full mt-auto">
        <Link
          href="/auth/login"
          className="block w-full py-4 rounded-full font-medium text-center bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
        >
          Continue
        </Link>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function ForgetPassword() {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifyCodes, setVerifyCodes] = useState(["", "", "", ""]);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handlePhoneSubmit = () => {
    setStep("verify");
  };

  const handleVerifySubmit = () => {
    setStep("setPin");
  };

  const handleSetPinSubmit = () => {
    setStep("confirmPin");
  };

  const handleConfirmPinSubmit = () => {
    if (pin === confirmPin) {
      setStep("success");
    } else {
      alert("PINs do not match. Please try again.");
      setConfirmPin("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      {step === "phone" && (
        <PhoneStep
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onNext={handlePhoneSubmit}
        />
      )}
      {step === "verify" && (
        <VerifyStep
          codes={verifyCodes}
          setCodes={setVerifyCodes}
          onNext={handleVerifySubmit}
          onPrev={() => setStep("phone")}
        />
      )}
      {step === "setPin" && (
        <SetPinStepComponent
          pin={pin}
          setPin={setPin}
          onNext={handleSetPinSubmit}
          onPrev={() => setStep("verify")}
        />
      )}
      {step === "confirmPin" && (
        <ConfirmPinStepComponent
          confirmPin={confirmPin}
          setConfirmPin={setConfirmPin}
          onConfirm={handleConfirmPinSubmit}
          onPrev={() => setStep("setPin")}
        />
      )}
      {step === "success" && <SuccessStep />}
    </div>
  );
}

