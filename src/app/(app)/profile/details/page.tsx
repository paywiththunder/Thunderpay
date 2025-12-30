"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import { getUserProfile } from "@/services/user";
import { toast } from "react-hot-toast";

interface InfoCard {
  id: number;
  label: string;
  value: string;
  hasIcon?: boolean;
  iconType?: "copy" | "chevron";
}

export default function ProfileDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getInitials = (firstName: string, lastName: string) => {
    const f = firstName ? firstName[0].toUpperCase() : "";
    const l = lastName ? lastName[0].toUpperCase() : "";
    return `${f}${l}` || "??";
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full flex-1 bg-black py-6 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  const initials = user ? getInitials(user.firstName, user.lastName) : "";

  // Construct dynamic info cards
  const infoCards: InfoCard[] = user ? [
    // Note: Account number is often separate, but using phone as placeholder if appropriate or omitted if not in profile response
    // Response showed 'accountTier', 'email', 'phone', 'dob', 'address', 'gender' (gender not in sample but in UI request)
    // I will include available fields
    {
      id: 1,
      label: "Email Address",
      value: user.email || "N/A",
      hasIcon: true,
      iconType: "copy",
    },
    {
      id: 2,
      label: "Account Tier",
      value: `Tier ${user.accountTier || "1"}`,
      hasIcon: false,
    },
    // {
    //   id: 3,
    //   label: "Gender",
    //   value: user.gender || "N/A", // API response sample didn't explicitly show gender, assuming it might be there or omitted
    //   hasIcon: false,
    // },
    {
      id: 4,
      label: "Date of Birth",
      value: user.dob || "N/A",
      hasIcon: false,
    },
    {
      id: 6,
      label: "Phone Number",
      value: user.phone || "N/A",
      hasIcon: true,
      iconType: "copy",
    },
  ] : [];


  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-10 h-10 rounded-full bg-black flex items-center justify-center border border-white/10"
        >
          <HiChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Profile Details</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 overflow-y-auto">
        {/* User Profile Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Profile Picture */}
          <div className="w-24 h-24 rounded-full bg-gray-600/50 overflow-hidden flex-shrink-0">
            {/* Placeholder for profile picture */}
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          </div>

          {/* Name */}
          <h2 className="text-white font-bold text-xl text-center">
            {displayName}
          </h2>
        </div>

        {/* Information Cards */}
        <div className="flex flex-col gap-3">
          {infoCards.map((card) => (
            <div
              key={card.id}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-white font-medium">{card.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-white max-w-[150px] truncate md:max-w-none">{card.value}</span>
                {card.hasIcon && (
                  <div className="flex-shrink-0">
                    {card.iconType === "copy" ? (
                      <button
                        onClick={() => handleCopy(card.value)}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        <HiOutlineDocumentDuplicate className="w-5 h-5" />
                      </button>
                    ) : (
                      <HiChevronRight className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
