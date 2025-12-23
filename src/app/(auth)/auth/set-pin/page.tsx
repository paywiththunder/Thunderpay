"use client";
import { useState } from "react";
import WelcomeStep from "../../../../components/auth/Welcomestep";
import SetPinStep from "../../../../components/auth/SetPinStep";
import ConfirmPinStep from "../../../../components/auth/ConfirmPinStep";
import AccountReadyStep from "../../../../components/auth/AccountReadyStep";
import { setPin as setPinApi } from "@/services/user";
import { Loader2 } from "lucide-react";

export default function SetupThunderPin() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => setStep((prev) => (prev + 1) as any);
  const handlePrev = () => setStep((prev) => (prev - 1) as any);

  const handleConfirm = async () => {
    if (pin !== confirmPin) {
      alert("PINs do not match");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await setPinApi(pin);
      setStep(4);
    } catch (err: any) {
      console.error("Error setting PIN:", err);
      setError(err?.message || "Failed to set PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col px-6 justify-center items-center py-10 w-full">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {step === 1 && <WelcomeStep onNext={handleNext} />}
      {step === 2 && (
        <SetPinStep
          pin={pin}
          setPin={setPin}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
      {step === 3 && (
        <ConfirmPinStep
          onPrev={handlePrev}
          confirmPin={confirmPin}
          setConfirmPin={setConfirmPin}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      )}
      {step === 4 && <AccountReadyStep />}

      {isLoading && step !== 3 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader2 className="w-10 h-10 animate-spin text-thunder-primary" />
        </div>
      )}
    </div>
  );
}
