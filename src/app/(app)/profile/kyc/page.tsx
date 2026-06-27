"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiChevronLeft, HiOutlineCloudArrowUp } from "react-icons/hi2";
import { getKycConfigs, submitKycTier2, DocumentType } from "@/services/user";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function KycPage() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.VotersCard);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  // Fetch KYC configs
  const { data: kycConfigsResponse, isLoading: configsLoading } = useQuery({
    queryKey: ['kycConfigs'],
    queryFn: getKycConfigs,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const kycConfigs = kycConfigsResponse?.success ? kycConfigsResponse.data : null;

  // Submit KYC mutation
  const submitMutation = useMutation({
    mutationFn: ({ params, formData }: { params: { documentType: DocumentType; documentNumber: string }, formData: { documentImage?: File; selfieImage?: File } }) =>
      submitKycTier2(params, formData),
    onSuccess: (data) => {
      console.log("KYC Submission Response:", data);
      if (data.success) {
        toast.success("KYC submitted successfully!");
        router.push("/profile");
      } else {
        toast.error(data.description || "KYC submission failed");
      }
    },
    onError: (error: any) => {
      console.error("KYC Error:", error);
      toast.error(error?.description || "Failed to submit KYC");
    }
  });

  const handleDocumentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentImage(e.target.files[0]);
    }
  };

  const handleSelfieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentNumber.trim()) {
      toast.error("Please enter document number");
      return;
    }

    if (!documentImage || !selfieImage) {
      toast.error("Please upload both document and selfie images");
      return;
    }

    submitMutation.mutate({
      params: { documentType, documentNumber },
      formData: { documentImage, selfieImage }
    });
  };

  if (configsLoading) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black py-6 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 bg-black py-6 pb-24">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6 mb-4">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <HiChevronLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto">
        {/* Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-300 text-sm">
            Complete your KYC verification to unlock higher transaction limits and additional features.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Document Type */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium text-sm">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 appearance-none bg-no-repeat bg-[length:20px_20px] bg-[position:right_1rem_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
              }}
            >
              <option value={DocumentType.VotersCard} className="bg-[#1C1C1E] text-white py-2">Voter's Card</option>
              <option value={DocumentType.DriversLicense} className="bg-[#1C1C1E] text-white py-2">Driver's License</option>
              <option value={DocumentType.Passport} className="bg-[#1C1C1E] text-white py-2">Passport</option>
              <option value={DocumentType.NationalID} className="bg-[#1C1C1E] text-white py-2">National ID</option>
            </select>
          </div>

          {/* Document Number */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium text-sm">Document Number</label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter your document number"
              className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Document Image */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium text-sm">Document Image</label>
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
              <HiOutlineCloudArrowUp className="w-12 h-12 text-gray-400" />
              <p className="text-gray-400 text-sm text-center">
                {documentImage ? documentImage.name : "Upload a clear photo of your document"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleDocumentImageChange}
                className="hidden"
                id="documentImage"
              />
              <label
                htmlFor="documentImage"
                className="px-6 py-2 bg-white/10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Selfie Image */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium text-sm">Selfie Image</label>
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
              <HiOutlineCloudArrowUp className="w-12 h-12 text-gray-400" />
              <p className="text-gray-400 text-sm text-center">
                {selfieImage ? selfieImage.name : "Upload a clear selfie holding your document"}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelfieImageChange}
                className="hidden"
                id="selfieImage"
              />
              <label
                htmlFor="selfieImage"
                className="px-6 py-2 bg-white/10 text-white rounded-full cursor-pointer hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitMutation.isPending || !documentNumber.trim() || !documentImage || !selfieImage}
            className={`w-full py-4 rounded-full font-medium transition-all ${
              !submitMutation.isPending && documentNumber.trim() && documentImage && selfieImage
                ? "bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 text-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
                : "bg-[#111] text-gray-600 border border-[#222] cursor-not-allowed"
            }`}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}
