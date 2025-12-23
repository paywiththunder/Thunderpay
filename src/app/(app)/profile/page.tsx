"use client";
import React from "react";
import Image from "next/image";
import {
  HiOutlineBell,
  HiOutlineGlobeAlt,
  HiOutlineQuestionMarkCircle,
  HiOutlineExclamationCircle,
  HiOutlineSun,
  HiOutlineStar,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiChevronRight,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";

interface MenuItem {
  id: number;
  icon: React.ElementType;
  label: string;
  link?: string;
  value?: string;
  isSignOut?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    icon: HiOutlineBell,
    label: "Notifications",
    link: "/profile/notifications",
  },
  {
    id: 2,
    icon: HiOutlineGlobeAlt,
    label: "Language",
    value: "English (US)",
    link: "/profile/language",
  },
  {
    id: 3,
    icon: HiOutlineQuestionMarkCircle,
    label: "Help center",
    link: "/profile/help-center",
  },
  {
    id: 4,
    icon: HiOutlineExclamationCircle,
    label: "Terms & Conditions",
    link: "/profile/terms-and-conditions",
  },
  {
    id: 5,
    icon: HiOutlineSun,
    label: "Theme",
    value: "Dark mode",
    link: "/profile/theme",
  },
  {
    id: 6,
    icon: HiOutlineStar,
    label: "Rate us",
    link: "/profile/rate-us",
  },
  {
    id: 7,
    icon: HiOutlineCog6Tooth,
    label: "Settings",
    link: "/profile/settings",
  },
  {
    id: 9,
    icon: HiOutlineLockClosed,
    label: "Reset PIN",   // Keep user's term 'Reset' for endpoint usage, or maybe "Forgot PIN" is better? User said 'reset pin and im done'. Let's keep both or clarification?
    // User requested "another set-pin component... in the app".
    // I will have both: 'Set PIN' (for changing/setting) and 'Reset PIN' (for recovery).
    link: "/profile/reset-pin",
  },
  {
    id: 10,
    icon: HiOutlineLockClosed,
    label: "Set New PIN",
    link: "/profile/set-pin",
  },
  {
    id: 8,
    icon: HiOutlineArrowRightOnRectangle,
    label: "Sign out",
    isSignOut: true,
    link: "/auth/logout",
  },
];

export default function ProfilePage() {
  const router = useRouter();

  const handleClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="flex flex-col w-full flex-1 bg-black py-6">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </header>

      <div className="flex flex-col gap-4 px-4 overflow-y-auto">
        {/* User Profile Card */}
        <div onClick={() => handleClick("/profile/id")} className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-600/50 overflow-hidden flex-shrink-0">
            {/* Placeholder for profile picture */}
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">AD</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            <h2 className="text-white font-bold text-lg mb-1">
              Agbani Darego Durojaye
            </h2>
            <p className="text-gray-400 text-sm">Tier 2</p>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 flex justify-between items-center">
          <div className="flex flex-col flex-grow">
            <h2 className="text-white font-bold text-lg mb-1">
              Upgrade your Bank Account
            </h2>
            <p className="text-white/90 text-sm">
              Level Up Your Banking Experience.
            </p>
          </div>
          <button className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors flex-shrink-0 ml-4">
            GO!!
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-3 mb-20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
                onClick={() => handleClick(item.link || "")}
              >
                <Icon
                  className={`w-6 h-6 flex-shrink-0 ${item.isSignOut ? "text-red-500" : "text-white"
                    }`}
                />
                <div className="flex items-center justify-between flex-grow">
                  <span
                    className={`font-medium ${item.isSignOut ? "text-red-500" : "text-white"
                      }`}
                  >
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-gray-400 text-sm">{item.value}</span>
                    )}
                    <HiChevronRight
                      className={`w-5 h-5 ${item.isSignOut ? "text-red-500" : "text-white"
                        }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

