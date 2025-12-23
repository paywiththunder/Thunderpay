"use client";
import React, { useState, useRef } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { useRouter } from "next/navigation";
import { setPin } from "@/services/user";
import toast from "react-hot-toast";

export default function SetPinPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1); // 1: Enter PIN, 2: Confirm PIN
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pinCodes, setPinCodes] = useState(["", "", "", ""]);
    const [confirmCodes, setConfirmCodes] = useState(["", "", "", ""]);

    const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setError("");
            setConfirmCodes(["", "", "", ""]);
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

        if (value && index < 3) {
            pinInputRefs.current[index + 1]?.focus();
        }

        if (newCodes.every((code) => code !== "") && index === 3 && step === 1) {
            // Move to confirm step
            setTimeout(() => {
                setStep(2);
                // Focus first confirm input?
                // We need a slight delay or effect to handle focus after render
            }, 100);
        }
    };

    const handleConfirmChange = (index: number, value: string) => {
        if (isLoading) return;
        if (value.length > 1) return;
        if (!/^[0-9]?$/.test(value)) return;

        const newCodes = [...confirmCodes];
        newCodes[index] = value;
        setConfirmCodes(newCodes);

        if (value && index < 3) {
            confirmInputRefs.current[index + 1]?.focus();
        }

        if (newCodes.every((code) => code !== "") && index === 3 && step === 2) {
            submitSetPin(newCodes.join(""));
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !pinCodes[index] && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    };

    const handleConfirmKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !confirmCodes[index] && index > 0) {
            confirmInputRefs.current[index - 1]?.focus();
        }
    };

    const submitSetPin = async (confirmPinVal: string) => {
        const originalPin = pinCodes.join("");
        if (originalPin !== confirmPinVal) {
            setError("PINs do not match. Please try again.");
            toast.error("PINs do not match");
            setConfirmCodes(["", "", "", ""]);
            confirmInputRefs.current[0]?.focus();
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            await setPin(originalPin);
            toast.success("PIN set successfully!");
            router.push("/profile");
        } catch (err: any) {
            console.error(err);
            setError(err.description || "Failed to set PIN");
            toast.error(err.description || "Failed to set PIN");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
            <header className="relative flex items-center justify-center px-4 py-6">
                <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20 disabled:opacity-50 hover:bg-white/5 transition-colors"
                >
                    <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                    {step === 1 ? "Set PIN" : "Confirm PIN"}
                </h1>
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                    <p className="text-gray-400 text-center mb-4">
                        {step === 1 ? "Enter your new 4-digit PIN." : "Re-enter your PIN to confirm."}
                    </p>

                    {step === 1 && (
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
                    )}

                    {step === 2 && (
                        <div className="flex justify-center gap-4">
                            {confirmCodes.map((digit, i) => (
                                <input
                                    key={`confirm-${i}`}
                                    ref={(el) => {
                                        confirmInputRefs.current[i] = el;
                                    }}
                                    disabled={isLoading}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        handleConfirmChange(i, val);
                                    }}
                                    onKeyDown={(e) => handleConfirmKeyDown(i, e)}
                                    autoFocus={i === 0}
                                    className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${error
                                        ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                                        : digit
                                            ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                            : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm font-medium animate-pulse text-center">
                            {error}
                        </p>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-blue-500 text-sm font-medium">Setting PIN...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
