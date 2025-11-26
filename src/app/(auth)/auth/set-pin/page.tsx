"use client";
import { useState } from "react";
import WelcomeStep from "../../../../components/auth/Welcomestep";
import SetPinStep from "../../../../components/auth/SetPinStep";
import ConfirmPinStep from "../../../../components/auth/ConfirmPinStep";
import AccountReadyStep from "../../../../components/auth/AccountReadyStep";

export default function SetupThunderPin() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleNext = () => setStep((prev) => (prev + 1) as any);
  const handlePrev = () => setStep((prev) => (prev - 1) as any);

  const handleConfirm = () => {
    if (pin !== confirmPin) {
      alert("PINs do not match");
      return;
    }
    setStep(4);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col px-6 justify-center items-center py-10 w-full">
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
        />
      )}
      {step === 4 && <AccountReadyStep />}
    </div>
  );
}
