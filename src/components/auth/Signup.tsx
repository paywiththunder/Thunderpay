"use client";
import { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";

export default function SignupForm() {
  const [gender, setGender] = useState("Male");

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress bar */}
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
          <Link href="/auth/set-pin">Upload</Link>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold mb-2">Let's get started</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Ready to take control? Let's get started with Thunderpay — your
          all-in-one money app.
        </p>

        {/* Form */}
        <form className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="input your first name"
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Middle Name
            </label>
            <input
              type="text"
              placeholder="input your middle name"
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Surname */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Surname</label>
            <input
              type="text"
              placeholder="input your surname"
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="input your email address"
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-gray-700 bg-[#121212] text-gray-400">
                +234
              </span>
              <input
                type="tel"
                placeholder="input phone number"
                className="w-full p-3 rounded-r-md bg-[#121212] border border-gray-700 border-l-0 text-white text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Referral Code
            </label>
            <input
              type="text"
              placeholder="input referral code (optional)"
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-3 rounded-full bg-blue-600 text-white font-medium mt-2 hover:bg-blue-700 transition"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
