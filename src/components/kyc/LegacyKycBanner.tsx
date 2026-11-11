'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { toast } from 'react-hot-toast';
import { completeLegacyKyc } from '@/services/auth';
import {
  isLegacyKycPending,
  setHasCompletedLegacyKyc,
} from '@/utils/legacyKyc';

const inputClass =
  'w-full bg-[#161616] border border-[#2B2F33] text-white placeholder-gray-600 px-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium';

export default function LegacyKycBanner({ name }: { name?: string }) {
  // localStorage only exists in the browser, so the server snapshot is "not
  // pending" and the real value is picked up after hydration without a mismatch.
  const storedPending = useSyncExternalStore(
    () => () => {},
    isLegacyKycPending,
    () => false
  );
  const [justCompleted, setJustCompleted] = useState(false);
  const isPending = storedPending && !justCompleted;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = nin.length === 11 && bvn.length === 11;

  const openModal = () => {
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const problems = [
      ...(nin.length === 11 ? [] : ['NIN must be exactly 11 digits']),
      ...(bvn.length === 11 ? [] : ['BVN must be exactly 11 digits']),
    ];
    if (problems.length) {
      setError(problems.join('. '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await completeLegacyKyc({ nin, bvn });

      if (!res?.success) {
        throw res;
      }

      setHasCompletedLegacyKyc(true);
      setJustCompleted(true);
      setIsModalOpen(false);
      toast.success(res.description || 'KYC verification completed');
    } catch (err: any) {
      setError(
        err?.description ||
        err?.message ||
        (typeof err === 'string' ? err : '') ||
        'KYC verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isPending) return null;

  return (
    <>
      {/* Banner */}
      <div className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
        Hello{name ? ` ${name}` : ''}. You have to complete your{' '}
        <button
          type="button"
          onClick={openModal}
          className="font-bold text-red-300 underline underline-offset-2 transition-colors hover:text-red-200 cursor-pointer"
        >
          KYC
        </button>{' '}
        verification to keep enjoying full access to your account.
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111214] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Complete your KYC</p>
              <button
                type="button"
                onClick={closeModal}
                className="text-sm text-gray-400 transition hover:text-white"
                aria-label="Close KYC form"
              >
                ✕
              </button>
            </div>

            <p className="mb-6 text-sm text-gray-300">
              Enter your NIN and BVN to complete your verification.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 block">NIN</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 block">BVN</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter your 11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-4 rounded-full font-medium transition-all mt-2 ${isValid && !loading
                  ? 'bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]'
                  : 'bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed'
                  }`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
