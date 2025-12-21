"use client";
import { useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();

  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Password Validation ---
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasMinLength || !hasLowercase || !hasUppercase || !hasDigit || !hasSpecial) {
      setError(
        "Password must contain at least one lowercase, one uppercase, one special character, one digit and be at least 8 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://aapi.paywiththunder.com/api/v1/auth/signup",
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
      console.log(email, password);

      const { success, data } = res.data;
      console.log(res.data);

      if (!success) {
        throw new Error("Signup failed");
      }

      // ✅ Save OTP + user info to localStorage
      localStorage.setItem("signupOtp", data.otp);
      localStorage.setItem("signupEmail", data.email);
      localStorage.setItem("signupUserId", data.id.toString());

      // ✅ Redirect to OTP page
      router.push("/auth/verify-number");
    } catch (err: any) {
      console.log(err);
      setError(
        err?.response?.data?.description ||
        err.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft />
          </Link>
          <Link href="/auth/login" className="text-blue-500 text-sm">
            Sign In
          </Link>
        </div>

        <h1 className="text-2xl font-semibold mb-2">Let's get started</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Ready to take control? Let's get started with Thunderpay.
        </p>

        <form className="space-y-4" onSubmit={handleSignup}>
          {/* Email */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-[#121212] border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
