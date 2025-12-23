"use client";
import React, { useState, useRef } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { useRouter } from "next/navigation";
import { resetPin, verifyResetPin } from "@/services/user";
import toast from "react-hot-toast";

export default function ResetPinPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1); // 1: Enter New PIN, 2: Verify Code
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pinCodes, setPinCodes] = useState(["", "", "", ""]);
    const [verifyCodes, setVerifyCodes] = useState(["", "", "", "", "", ""]); // Assuming 6 digit code based on "872251"

    const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setError("");
            // Reset verify codes
            setVerifyCodes(["", "", "", "", "", ""]);
        } else {
            router.back();
        }
    };

    const handlePinChange = (index: number, value: string) => {
        if (isLoading) return;
        if (value.length > 1) return;
        if (!/^[0-9]?$/.test(value)) return;

        const newCodes = [...pinCodes];
        newCodes[index] = value;
        setPinCodes(newCodes);

        // Auto-advance
        if (value && index < 3) {
            pinInputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 4 digits are entered
        if (newCodes.every((code) => code !== "") && index === 3 && step === 1) {
            submitNewPin(newCodes.join(""));
        }
    };

    const handleVerifyChange = (index: number, value: string) => {
        if (isLoading) return;
        if (value.length > 1) return;
        if (!/^[0-9]?$/.test(value)) return;

        const newCodes = [...verifyCodes];
        newCodes[index] = value;
        setVerifyCodes(newCodes);

        // Auto-advance
        if (value && index < 5) {
            verifyInputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (newCodes.every((code) => code !== "") && index === 5 && step === 2) {
            submitVerifyCode(newCodes.join(""));
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isLoading) return;
        if (e.key === "Backspace" && !pinCodes[index] && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isLoading) return;
        if (e.key === "Backspace" && !verifyCodes[index] && index > 0) {
            verifyInputRefs.current[index - 1]?.focus();
        }
    };

    const submitNewPin = async (pin: string) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await resetPin(pin);

            if (response && response.data) {
                toast.success(`Verification Code: ${response.data}`, { duration: 10000 });
            } else {
                toast.success("PIN reset initiated! Check your messages.");
            }

            console.log("Reset PIN Response:", response); // For debugging
            setStep(2);
        } catch (err: any) {
            console.error(err);
            setError(err.description || "Failed to initiate PIN reset");
            toast.error(err.description || "Failed to initiate PIN reset");
        } finally {
            setIsLoading(false);
        }
    };

    const submitVerifyCode = async (code: string) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await verifyResetPin(code);
            toast.success("PIN reset successful!");
            console.log("Verify Response:", response);
            router.push("/profile");
        } catch (err: any) {
            console.error(err);
            setError(err.description || "Verification failed");
            toast.error(err.description || "Verification failed");
            // Reset code on failure?
            setVerifyCodes(["", "", "", "", "", ""]);
            verifyInputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
            {/* Header */}
            <header className="relative flex items-center justify-center px-4 py-6">
                <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 disabled:opacity-50 hover:bg-white/5 transition-colors"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {step === 1 ? "Reset PIN" : "Verify Code"}
                </h1>
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">

                    {step === 1 && (
                        <>
                            <p className="text-gray-400 text-center mb-4">
                                Enter your new 4-digit PIN to reset your security pin.
                            </p>
                            <div className="flex justify-center gap-4">
                                {pinCodes.map((digit, i) => (
                                    <input
                                        key={`pin-${i}`}
                                        ref={(el) => {
                                            pinInputRefs.current[i] = el;
                                        }}
                                        disabled={isLoading}
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            handlePinChange(i, val);
                                        }}
                                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                                        className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${error
                                            ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                                            : digit
                                                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-gray-400 text-center mb-4">
                                Enter the 6-digit verification code sent to you.
                            </p>
                            <div className="flex justify-center gap-2">
                                {verifyCodes.map((digit, i) => (
                                    <input
                                        key={`verify-${i}`}
                                        ref={(el) => {
                                            verifyInputRefs.current[i] = el;
                                        }}
                                        disabled={isLoading}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            handleVerifyChange(i, val);
                                        }}
                                        onKeyDown={(e) => handleVerifyKeyDown(i, e)}
                                        className={`w-10 h-14 text-center text-xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${error
                                            ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                                            : digit
                                                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm font-medium animate-pulse text-center">
                            {error}
                        </p>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-blue-500 text-sm font-medium">Processing...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
