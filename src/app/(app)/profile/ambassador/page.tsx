"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAmbassadorApplications,
  applyForAmbassador,
  AmbassadorApplication,
} from "@/services/ambassador";
import { useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi2";
import { toast } from "react-hot-toast";

export default function AmbassadorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  // query returns the raw API response (success/data wrapper); unwrap below
  const { data: appsResponse, isLoading } = useQuery<any>({
    queryKey: ["ambassadorApplications"],
    queryFn: getAmbassadorApplications,
  });

  const mutation = useMutation<any, any, string | undefined>({
    mutationFn: applyForAmbassador,
    onSuccess: () => {
      toast.success("Application submitted");
      queryClient.invalidateQueries({ queryKey: ["ambassadorApplications"] });
      setReason("");
    },
    onError: (err: any) => {
      const message = err?.message || err?.description || "Failed to apply";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length > 2000) return;
    mutation.mutate(reason || undefined as string | undefined);
  };

  // normalize apps into an array regardless of wrapper
  const apps: AmbassadorApplication[] = Array.isArray(appsResponse)
    ? appsResponse
    : appsResponse?.success
    ? appsResponse.data
    : [];

  const hasPending = apps.some((a) => a.status === "PENDING");
  const isApproved = apps.some((a) => a.status === "APPROVED");

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Ambassador</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col w-full flex-1 bg-black py-6 items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>            
            {apps.length > 0 && (
              <div className="space-y-3">
                {apps.map((a) => (
                  <div
                    key={a.id}
                    className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4"
                  >
                    <div className="flex justify-between">
                      <p className="text-white font-medium">{a.status}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {a.reason && (
                      <p className="text-gray-400 text-sm mt-1">
                        {a.reason}
                      </p>
                    )}
                    {a.decidedAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        Decided {new Date(a.decidedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(hasPending || isApproved) && (
              <p className="text-gray-400 text-center mt-4">
                {isApproved
                  ? "You are already an ambassador."
                  : "Your application is pending review."}
              </p>
            )}

            {!hasPending && !isApproved && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="text-gray-400 text-sm">
                  Why do you want to become an ambassador? (optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0f1112] text-white p-3 rounded-xl border border-[#2B2F33] focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{reason.length}/2000</span>
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-4 rounded-full font-bold text-white bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Sending…" : "Apply"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
