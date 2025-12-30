"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import {
  HiOutlineLightBulb,
  HiOutlineDevicePhoneMobile,
  HiOutlineGlobeAlt,
  HiChevronRight,
} from "react-icons/hi2";
import {
  GiGamepad,
  GiGraduateCap,
  GiHeartPlus,
  GiAirplane,
} from "react-icons/gi";
import { BsTv } from "react-icons/bs";

interface BillCategory {
  id: number;
  name: string;
  icon: React.ElementType;
  route: string;
}

const billCategories: BillCategory[] = [
  {
    id: 1,
    name: "Electricity",
    icon: HiOutlineLightBulb,
    route: "/crypto/pay-bills/electricity",
  },
  {
    id: 2,
    name: "TV",
    icon: BsTv,
    route: "/crypto/pay-bills/tv",
  },
  {
    id: 3,
    name: "Airtime",
    icon: HiOutlineDevicePhoneMobile,
    route: "/crypto/pay-bills/airtime",
  },
  {
    id: 4,
    name: "Data",
    icon: HiOutlineGlobeAlt,
    route: "/crypto/pay-bills/data",
  },
  {
    id: 5,
    name: "Betting",
    icon: GiGamepad,
    route: "/crypto/pay-bills/betting",
  },
  {
    id: 6,
    name: "Education",
    icon: GiGraduateCap,
    route: "/crypto/pay-bills/education",
  },
  {
    id: 7,
    name: "Health & Insurance",
    icon: GiHeartPlus,
    route: "/crypto/pay-bills/insurance",
  },
  {
    id: 8,
    name: "Flight",
    icon: GiAirplane,
    route: "/crypto/pay-bills/flight",
  },
];

export default function PayBillsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      {/* Header */}
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Pay Bills</h1>
      </header>

      {/* Bill Categories List */}
      <div className="flex flex-col gap-3 px-4 overflow-y-auto">
        {billCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.route}
              className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Icon className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-white font-medium">{category.name}</span>
              </div>
              <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

