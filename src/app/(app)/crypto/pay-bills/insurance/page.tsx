"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";

interface InsuranceCategory {
  id: string;
  name: string;
  route: string;
}

const insuranceCategories: InsuranceCategory[] = [
  {
    id: "health",
    name: "Health Insurance",
    route: "/pay-bills/insurance/health",
  },
  {
    id: "life",
    name: "Life Insurance",
    route: "/pay-bills/insurance/life",
  },
  {
    id: "motor",
    name: "Motor Vehicle Insurance",
    route: "/pay-bills/insurance/motor",
  },
  {
    id: "property",
    name: "Property & Home Insurance",
    route: "/pay-bills/insurance/property",
  },
  {
    id: "travel",
    name: "Travel Insurance",
    route: "/pay-bills/insurance/travel",
  },
];

export default function InsurancePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full flex-1 bg-black min-h-full py-6">
      <header className="relative flex items-center justify-center px-4 py-6">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Insurance</h1>
      </header>

      <div className="flex flex-col gap-3 px-4 overflow-y-auto pb-6">
        {insuranceCategories.map((category) => (
          <Link
            key={category.id}
            href={category.route}
            className="bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">
                  {category.name.charAt(0)}
                </span>
              </div>
              <span className="text-white font-medium text-base">
                {category.name}
              </span>
            </div>
            <HiChevronRight className="w-5 h-5 text-white flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
