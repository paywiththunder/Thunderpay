"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReferrals, Referral } from "@/services/user";
import { useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi2";

export default function ReferralsPage() {
  const router = useRouter();
  const { data: referralsResponse, isLoading } = useQuery<any>({
    queryKey: ["referrals"],
    queryFn: getReferrals,
  });

  const referrals: Referral[] = Array.isArray(referralsResponse)
    ? referralsResponse
    : referralsResponse?.success
    ? referralsResponse.data
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black py-6 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Your Referrals</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto">
        {referrals.length === 0 ? (
          <p className="text-gray-400">You haven't referred anyone yet.</p>
        ) : (
          <div className="space-y-3">
            {referrals.map((r) => (
              <div
                key={r.referredUserId}
                className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {r.name || r.email || "Unnamed user"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {r.email}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      r.qualified ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {r.qualified ? "Qualified" : "Pending"}
                  </p>
                </div>
                <div className="mt-2 text-gray-400 text-xs">
                  Spend USD: ${r.totalSpendUsd.toFixed(2)} | NGN: ₦{r.totalSpendNgn.toLocaleString()}
                </div>
                <div className="mt-1 text-gray-400 text-xs">
                  Referred {new Date(r.referredAt).toLocaleDateString()}
                  {r.qualifiedAt && (
                    <> • Qualified {new Date(r.qualifiedAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
