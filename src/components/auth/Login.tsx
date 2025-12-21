"use client";
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

// --- Types ---
type PhoneStepProps = {
  email: string;
  setEmail: (value: string) => void;
  onNext: () => void;
};

type PinStepProps = {
  pin: string;
  setPin: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

// --- Component 1: Email Input Step ---
const PhoneInputStep: React.FC<PhoneStepProps> = ({
  email,
  setEmail,
  onNext,
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
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
            Email Address
          </label>

          <div className="flex items-center gap-3">
            {/* Left Static Button (kept for styling consistency) */}
            <button
              type="button"
              className="flex items-center gap-2 bg-[#161616] border border-[#2B2F33] text-white px-3 py-3.5 rounded-xl min-w-[100px] hover:border-gray-600 transition-colors"
            >
              <span className="text-lg">📧</span>
              <span className="text-sm font-medium">Email</span>
              <ChevronDown size={14} className="text-gray-400 ml-auto" />
            </button>

            {/* Email Input */}
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="input email address"
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!email}
          className={`w-full py-4 rounded-full font-medium transition-all ${email
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

// --- Component 2: Password Entry Step ---
const PinEntryStep: React.FC<PinStepProps> = ({
  pin,
  setPin,
  onConfirm,
  onBack,
}) => {
  const [codes, setCodes] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (pin.length === 4 && codes.join("") !== pin) {
      setCodes(pin.split(""));
    }
    if (!pin) {
      setCodes(["", "", "", ""]);
    }
  }, [pin]);

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

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .slice(0, 4)
      .replace(/\D/g, "");

    const newCodes = ["", "", "", ""];
    pasted.split("").forEach((char, i) => {
      newCodes[i] = char;
    });

    setCodes(newCodes);
    setPin(newCodes.join(""));
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full pt-10 px-4 pb-6 items-center">
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold text-center">Enter Password</h1>

        <Link
          href="/auth/sign-up"
          className="text-blue-500 text-sm font-medium"
        >
          Sign Up
        </Link>
      </div>

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
            onChange={(e) =>
              handleChange(i, e.target.value.replace(/\D/g, ""))
            }
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-1 transition-all ${digit
              ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
              : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              }`}
          />
        ))}
      </div>

      <Link
        href="/auth/forget-password"
        className="text-blue-500 text-sm font-medium mb-12 hover:text-blue-400"
      >
        Forgot Password?
      </Link>

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

// --- Main Page ---

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://aapi.paywiththunder.com/api/v1/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res)

      const { success, data, description } = res.data;

      if (!success) {
        throw new Error(description || "Login failed");
      }

      // ✅ Store token
      localStorage.setItem("authToken", data.token);
      const isContinueSignup = data.hasCompletedSignup

      console.log("Login successful:", data);

      // 👉 redirect
      if (!isContinueSignup) {
        router.push("/auth/continue-signup");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.description ||
        err?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white flex justify-center">
      <div className="flex flex-col max-w-md mx-auto w-full pt-10 px-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
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
        <div className="flex justify-between flex-col flex-1 space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 block">
              Email Address
            </label>
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="input email address"
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 block">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>

          <Link
            href="/auth/forget-password"
            className="text-blue-500 text-sm font-medium hover:text-blue-400"
          >
            Forgot Password?
          </Link>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={!email || !password || loading}
            className={`w-full py-4 rounded-full font-medium transition-all ${email && password
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
