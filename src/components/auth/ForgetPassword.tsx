"use client";
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import Ready from '../../../public/ready.png';
import { forgotPassword, resetPassword } from "@/services/auth";
import { toast } from "react-hot-toast";

type Step = "email" | "reset" | "success";

// --- Step 1: Email Input ---
const EmailStep = ({
  email,
  setEmail,
  onNext,
  isLoading
}: {
  email: string;
  setEmail: (value: string) => void;
  onNext: () => void;
  isLoading: boolean;
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
          Enter your email address to reset
          <br />
          your password.
        </p>
      </div>

      {/* Form */}
      <div className="flex justify-between flex-col flex-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 block">
              Email Address
            </label>
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!email || isLoading}
          className={`w-full py-4 rounded-full font-medium transition-all ${email && !isLoading
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
            }`}
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

// --- Step 2: Reset Password (6 digit code + New Password) ---
const ResetPasswordStep = ({
  codes,
  setCodes,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onNext,
  onPrev,
  isLoading
}: {
  codes: string[];
  setCodes: (codes: string[]) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const val = value.replace(/\D/g, ""); // Allow only numbers

    const newCodes = [...codes];
    newCodes[index] = val;
    setCodes(newCodes);

    // Auto focus next
    if (val && index < 5) {
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
    const pasted = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    const newCodes = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => {
      newCodes[i] = char;
    });
    setCodes(newCodes);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const isComplete = codes.every((c) => c !== "") && newPassword.length >= 6 && confirmPassword === newPassword;

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

      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 text-sm">
          Enter the 6-digit code sent to your email
          <br />
          and create a new password.
        </p>
      </div>

      {/* 6 Digit OTP Inputs */}
      <div className="flex justify-between gap-2 mb-6 w-full max-w-[350px] mx-auto">
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
            className={`w-12 h-14 text-center text-xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all ${code
                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              }`}
          />
        ))}
      </div>

      {/* New Password Inputs */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 block">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 block">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        <button
          onClick={onNext}
          disabled={!isComplete || isLoading}
          className={`w-full py-4 rounded-full font-medium transition-all ${isComplete && !isLoading
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
            }`}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

// --- Step 3: Success ---
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
        <div className="mb-10">
          <Image width={100} height={100} src={Ready} alt="Ready" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h1>
      <p className="text-gray-400 text-sm text-center mb-8">
        Your password has been updated securely.
        <br />
        You can now sign in to your accounts.
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
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verifyCodes, setVerifyCodes] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const resp = await forgotPassword(email);
      if (resp.success) {
        toast.success("Verification code sent to your email.");
        setStep("reset");
      }
    } catch (err: any) {
      toast.error(err?.description || "Failed to send reset code. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const code = verifyCodes.join("");
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const resp = await resetPassword(code, newPassword);
      if (resp.success) {
        toast.success("Password reset successfully.");
        setStep("success");
      }
    } catch (err: any) {
      toast.error(err?.description || "Failed to reset password. Check your code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      {step === "email" && (
        <EmailStep
          email={email}
          setEmail={setEmail}
          onNext={handleEmailSubmit}
          isLoading={isLoading}
        />
      )}
      {step === "reset" && (
        <ResetPasswordStep
          codes={verifyCodes}
          setCodes={setVerifyCodes}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onNext={handleResetSubmit}
          onPrev={() => setStep("email")}
          isLoading={isLoading}
        />
      )}
      {step === "success" && <SuccessStep />}
    </div>
  );
}
