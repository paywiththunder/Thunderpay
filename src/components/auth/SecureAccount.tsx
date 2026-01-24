"use client";

import { useState } from "react";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

export default function SecureAccount() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);

  const rules = [
    {
      text: "At least 8 characters long",
      ok: pw.length >= 8,
    },
    {
      text: "At least one lowercase letter",
      ok: /[a-z]/.test(pw),
    },
    {
      text: "At least one uppercase letter",
      ok: /[A-Z]/.test(pw),
    },
    {
      text: "At least one number",
      ok: /\d/.test(pw),
    },
    {
      text: "At least one special character",
      ok: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex items-start justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F]  text-[1.2rem] border border-white/20"
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

        <h2 className="text-2xl font-semibold mb-2">Secure your account</h2>
        <p className="text-sm text-[#98A0A8] mb-6">
          Keep your account safe with a strong and unique password.
        </p>

        <label className="block text-sm text-[#98A0A8] mb-2">
          Create a Password
        </label>
        <div className="relative mb-3">
          <input
            type={show ? "text" : "password"}
            className="w-full bg-[#0f1112] border border-[#2b2f33] rounded px-4 py-3"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9aa3ab]"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <div className="mb-3 text-sm">
          {rules.map((r, idx) => (
            <div
              key={idx}
              className={`mb-2 ${r.ok ? "text-[#BFF1C0]" : "text-[#E64C4C]"}`}
            >
              {r.text}
            </div>
          ))}
        </div>

        <label className="block text-sm text-[#98A0A8] mb-2">
          Re-type the Password
        </label>
        <div className="relative mb-6">
          <input
            type={show ? "text" : "password"}
            className="w-full bg-[#0f1112] border border-[#2b2f33] rounded px-4 py-3"
            placeholder="re-type password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9aa3ab]"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <div className="mt-8">
          <button
            disabled={!(rules.every((r) => r.ok) && pw === pw2)}
            className={`w-full py-3 rounded-full ${rules.every((r) => r.ok) && pw === pw2
              ? "bg-[#0ea5a0]"
              : "bg-[#1f2224]/60"
              } text-black font-semibold`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
