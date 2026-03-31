"use client";
import { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function ContinueSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const router = useRouter();

  const handleContinueSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      console.log('token', token);

      // Prepend +234 if the user only entered digits
      // const formattedPhone = phone && !phone.startsWith('+') ? `+234${phone.replace(/^0+/, '')}` : phone;

      const payload = {
        firstName,
        lastName,
        dob,
        phone,
        street,
        city,
        state,
        country,
        nin,
        bvn,
        referralCode,
      };

      console.log("Submitting Payload:", payload);

      const res = await axios.post(
        `${API_BASE_URL}/auth/complete-signup`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { success, data } = res.data;

      if (!success) {
        throw new Error("Continue signup failed");
      }

      console.log("Signup continued successfully:", res.data);

      router.push("/auth/set-pin");
      localStorage.setItem("firstName", data.firstName);
      localStorage.setItem("lastName", data.lastName);
      localStorage.setItem("dob", data.dob);
      localStorage.setItem("phone", data.phone);
      localStorage.setItem("street", data.street);
      localStorage.setItem("nin", data.nin);

    } catch (err: any) {
      console.error('Signup error details:', err.response?.data);
      const apiErrors = err?.response?.data?.errors;
      const apiDescription = err?.response?.data?.description;

      let errorList: string[] = [];

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        errorList = apiErrors;
      } else if (apiDescription) {
        errorList = [apiDescription];
      } else {
        errorList = [err.message || "Something went wrong"];
      }

      if (errorList.some(e => e.includes('Already completed signup'))) {
        router.push("/home");
      }

      setErrors(errorList);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
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
            href="/auth/login"
            className="text-blue-500 text-sm font-medium"
          >
            Sign In
          </Link>
        </div>

        <div className="mb-10 space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Complete your profile
          </h1>
          <p className="text-gray-400 text-sm">
            Just a few more details to get started.
          </p>
        </div>

        <form
          onSubmit={handleContinueSignup}
          className="flex flex-col flex-1 justify-between space-y-6"
        >
          <div className="space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl space-y-2">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-red-500 text-xs font-medium leading-relaxed">{err}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#161616] border border-[#2B2F33] text-white px-3 py-3.5 rounded-xl min-w-[90px]">
                <span className="text-lg">🇳🇬</span>
                <span className="text-sm font-medium">+234</span>
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#161616] border border-[#2B2F33] text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />

            <input
              type="text"
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />

              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>

            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="NIN"
                value={nin}
                onChange={(e) => setNin(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />

              <input
                type="text"
                placeholder="BVN"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
              />
            </div>

            <input
              type="text"
              placeholder="Referral Code"
              value={referralCode || ""}
              onChange={(e) => setReferralCode(e.target.value || null)}
              className="w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-medium transition-all mt-4 ${!loading
              ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
              : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
              }`}
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}
