"use client";
import React, { useState, useRef } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { useRouter } from "next/navigation";
import { resetPin, verifyResetPin, setPin } from "@/services/user";
import toast from "react-hot-toast";

export default function ResetPinPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Confirmation, 2: Verify Code, 3: Reset PIN
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [verifyCodes, setVerifyCodes] = useState(["", "", "", "", "", ""]); // 6-digit verification code
    const [newPinCodes, setNewPinCodes] = useState(["", "", "", ""]); // 4-digit new PIN

    const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const newPinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setError("");
            setVerifyCodes(["", "", "", "", "", ""]);
        } else if (step === 3) {
            setStep(2);
            setError("");
            setNewPinCodes(["", "", "", ""]);
        } else {
            router.back();
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
        if (newCodes.every((code) => code !== "") && index === 5) {
            submitVerifyCode(newCodes.join(""));
        }
    };

    const handleVerifyKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isLoading) return;
        if (e.key === "Backspace" && !verifyCodes[index] && index > 0) {
            verifyInputRefs.current[index - 1]?.focus();
        }
    };

    const handleNewPinChange = (index: number, value: string) => {
        if (isLoading) return;
        if (value.length > 1) return;
        if (!/^[0-9]?$/.test(value)) return;

        const newCodes = [...newPinCodes];
        newCodes[index] = value;
        setNewPinCodes(newCodes);

        // Auto-advance
        if (value && index < 3) {
            newPinInputRefs.current[index + 1]?.focus();
        }
    };

    const handleNewPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isLoading) return;
        if (e.key === "Backspace" && !newPinCodes[index] && index > 0) {
            newPinInputRefs.current[index - 1]?.focus();
        }
    };

    const submitConfirmation = async () => {
        setIsLoading(true);
        setError("");
        try {
            // Send empty body to initiate PIN reset
            const response = await resetPin("");

            toast.success("Verification code sent to your email!");
            console.log("Reset PIN Initiated:", response);
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

            toast.success("Code verified! Now enter your new PIN.");
            console.log("Verify Code Response:", response);
            setStep(3);
        } catch (err: any) {
            console.error(err);
            setError(err.description || "Invalid verification code");
            toast.error(err.description || "Invalid verification code");
            setVerifyCodes(["", "", "", "", "", ""]);
        } finally {
            setIsLoading(false);
        }
    };

    const submitNewPin = async () => {
        if (newPinCodes.some((code) => code === "")) {
            setError("Please enter a complete 4-digit PIN");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const newPin = newPinCodes.join("");
            const response = await setPin(newPin);

            toast.success("PIN reset successfully!");
            console.log("PIN Reset Response:", response);
            
            // Redirect to profile after successful reset
            setTimeout(() => {
                router.push("/profile");
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.description || "Failed to reset PIN");
            toast.error(err.description || "Failed to reset PIN");
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
                    {step === 1 ? "Reset PIN" : step === 2 ? "Verify Code" : "Enter New PIN"}
                </h1>
            </header>

            <div className="flex flex-col items-center justify-center flex-1 px-4 pb-6">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm">

                    {step === 1 && (
                        <>
                            <div className="text-center">
                                <p className="text-gray-300 text-lg font-medium mb-2">
                                    Are you sure you want to reset your PIN?
                                </p>
                                <p className="text-gray-500 text-sm">
                                    You will receive a verification code via email.
                                </p>
                            </div>

                            <button
                                onClick={submitConfirmation}
                                disabled={isLoading}
                                className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                            >
                                {isLoading ? "Sending..." : "Yes, Reset PIN"}
                            </button>

                            {error && (
                                <p className="text-red-500 text-sm font-medium text-center">
                                    {error}
                                </p>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-gray-400 text-center mb-4">
                                Enter the 6-digit verification code sent to your email.
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

                            {error && (
                                <p className="text-red-500 text-sm font-medium text-center animate-pulse">
                                    {error}
                                </p>
                            )}

                            {isLoading && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="text-blue-500 text-sm font-medium">Verifying...</p>
                                </div>
                            )}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <p className="text-gray-400 text-center mb-4">
                                Enter your new 4-digit PIN.
                            </p>
                            <div className="flex justify-center gap-4">
                                {newPinCodes.map((digit, i) => (
                                    <input
                                        key={`new-pin-${i}`}
                                        ref={(el) => {
                                            newPinInputRefs.current[i] = el;
                                        }}
                                        disabled={isLoading}
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            handleNewPinChange(i, val);
                                        }}
                                        onKeyDown={(e) => handleNewPinKeyDown(i, e)}
                                        className={`w-14 h-14 text-center text-2xl font-medium rounded-xl border bg-[#0f1112] focus:outline-none focus:ring-2 transition-all ${error
                                            ? "border-red-500 text-red-500 focus:border-red-500 focus:ring-red-500"
                                            : digit
                                                ? "border-blue-500/50 text-white ring-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                                                : "border-[#2B2F33] text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={submitNewPin}
                                disabled={isLoading || newPinCodes.some((code) => code === "")}
                                className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                            >
                                {isLoading ? "Resetting..." : "Reset PIN"}
                            </button>

                            {error && (
                                <p className="text-red-500 text-sm font-medium text-center animate-pulse">
                                    {error}
                                </p>
                            )}

                            {isLoading && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <p className="text-blue-500 text-sm font-medium">Processing...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
