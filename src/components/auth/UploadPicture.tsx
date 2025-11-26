"use client";

import { useRef, useState } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";

interface Avatar {
  id: number;
  src?: string;
}

export default function UploadPicture() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const avatars: Avatar[] = new Array(20).fill(0).map((_, i) => ({
    id: i + 1,
  }));

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);

    setPreview(url);
    setSelectedAvatar(null); // clear avatar if user uploads image
  };

  const handleAvatarSelect = (id: number) => {
    setSelectedAvatar(id);
    setPreview(null); // clear uploaded image if avatar selected
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedAvatar(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex items-start justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F]  text-[1.2rem] border border-white/20"
          >
            <MdOutlineKeyboardDoubleArrowLeft />
          </Link>
          <Link
            href="/auth/login"
            className="text-blue-500 text-sm font-medium"
          >
            Sign In
          </Link>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-2">Upload your picture</h2>
        <p className="text-sm text-[#98A0A8] mb-6">
          Add a photo or avatar to personalize and secure your Thunder account.
        </p>

        {/* Preview Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48">
            {/* If uploaded file */}
            {preview && (
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#2B2F33] bg-[#0f1112]">
                <img
                  src={preview}
                  alt="uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* If avatar selected */}
            {!preview && selectedAvatar && (
              <div className="w-48 h-48 rounded-full border-4 border-[#2B2F33] bg-[#cfe1f8] flex items-center justify-center">
                <div className="text-3xl font-bold text-[#062029]">
                  A{selectedAvatar}
                </div>
              </div>
            )}

            {/* No selection → empty upload circle */}
            {!preview && !selectedAvatar && (
              <div className="w-48 h-48 rounded-full border-4 border-dashed border-[#2B2F33] flex items-center justify-center bg-[#0f1112]">
                <div className="text-center px-6">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mx-auto mb-4"
                  >
                    <path
                      d="M12 5v6"
                      stroke="#9aa3ab"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4"
                      stroke="#9aa3ab"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 7a4 4 0 1 0-8 0"
                      stroke="#9aa3ab"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-[#9aa3ab]">
                    Please upload a Profile Picture
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-md bg-[#111316] border border-[#2b2f33] text-sm"
                    >
                      Upload a file
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Remove button */}
            {(preview || selectedAvatar) && (
              <button
                onClick={clearSelection}
                className="absolute -top-2 -right-2 bg-[#111215] text-sm p-1 rounded-full border border-[#2b2f33]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18"
                    stroke="#ff6b6b"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="#ff6b6b"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Avatar Section */}
        <div className="mb-4 text-sm text-[#9aa3ab]">Use avatars instead</div>

        <div className="grid grid-cols-5 gap-3">
          {avatars.map((a) => {
            const isSelected = selectedAvatar === a.id;
            return (
              <button
                key={a.id}
                onClick={() => handleAvatarSelect(a.id)}
                className={`w-full h-20 rounded-md flex items-center justify-center ${
                  isSelected ? "ring-4 ring-[#cfe1f8]/40" : "bg-[#111315]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-[#cfe1f8] text-[#062029]" : "bg-[#2b2f33]"
                  }`}
                >
                  {a.id}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
