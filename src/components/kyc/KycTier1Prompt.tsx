'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/user';
import {
  getKycStatus,
  isKycRejected,
  setKycTier1PromptDismissed,
  shouldShowKycTier1Prompt,
} from '@/utils/kycPrompt';

export default function KycTier1Prompt() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userResponse } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    staleTime: 30_000,
    retry: false,
  });

  const user = userResponse?.success ? userResponse.data : null;

  useEffect(() => {
    if (!user) return;

    const status = getKycStatus(user);
    const shouldShow = shouldShowKycTier1Prompt(user);

    if (status && isKycRejected(status)) {
      const timer = window.setTimeout(() => setIsOpen(true), 2000);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setIsOpen(shouldShow), 2000);
    return () => window.clearTimeout(timer);
  }, [user]);

  const handleLater = () => {
    setKycTier1PromptDismissed(true);
    setIsOpen(false);
  };

  const handleContinue = () => {
    setKycTier1PromptDismissed(true);
    setIsOpen(false);
    router.push('/profile/kyc');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Complete your KYC</p>
          <button
            type="button"
            onClick={handleLater}
            className="text-sm text-gray-400 transition hover:text-white"
            aria-label="Close KYC reminder"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-300">
          <p>
            You are currently on Tier 1. Complete your verification to unlock a higher transaction limit.
          </p>
          <p className="text-gray-400">
            This reminder will reappear only if your KYC is rejected.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleLater}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 rounded-full border border-white/20 bg-gradient-to-b from-[#161616] to-[#0F0F0F] px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] transition hover:opacity-95"
          >
            Complete KYC
          </button>
        </div>
      </div>
    </div>
  );
}
