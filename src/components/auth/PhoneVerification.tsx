"use client";

import { useState, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function MailVerification() {
  const [codes, setCodes] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < codes.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    const newCodes = [...codes];

    pasted.split("").forEach((char, i) => {
      if (i < 6) newCodes[i] = char;
    });

    setCodes(newCodes);
    inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
  };

  /* --------------------------------------------------
   Verify OTP
  -------------------------------------------------- */
  const handleVerify = async () => {
    setError("");
    setLoading(true);

    const otp = codes.join("");
    const email = localStorage.getItem("signupEmail");

    if (!email) {
      setError("Email not found. Please restart signup.");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/verify`,
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      const { success, data } = res.data;

      if (!success) {
        throw new Error("Verification failed");
      }

      /* --------------------------------------------------
       CLEAN UP (IMPORTANT)
      -------------------------------------------------- */
      // localStorage.removeItem("signupEmail");

      console.log("Verification successful:", data);

      // 👉 redirect or continue flow here
      router.push("/auth/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.description ||
        err?.message ||
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
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
          Verify your Email Address
        </h2>
        <p className="text-sm text-[#98A0A8] mb-6">
          We've sent a 6-digit code to your email — enter it to complete
          verification.
        </p>

        {/* OTP Inputs */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 w-full">
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
              className="md:w-14 w-12 md:h-16 h-12 text-center text-2xl font-medium rounded-lg border border-[#2B2F33] bg-[#0f1112] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium mt-4 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
