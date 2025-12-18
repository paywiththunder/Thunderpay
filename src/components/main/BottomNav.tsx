"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { HiHome, HiCreditCard, HiGift, HiUser } from "react-icons/hi2";

const navItems = [
  { name: "Home", href: "/home", icon: HiHome },
  { name: "Cards", href: "/cards", icon: HiCreditCard },
  { name: "Rewards", href: "/rewards", icon: HiGift },
  // Profile is linked but we aren't building the page in this scope
  { name: "Profile", href: "/profile", icon: HiUser },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-3 left-10 right-10 md:left-1/2 md:-translate-x-1/2 md:max-w-md border-t border-app-lighter rounded-full px-6 py-4 z-50 bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]">
      <div className="flex justify-between gap-3 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-center gap-1 w-full rounded-[100px] py-3 md:py-4 px-2 sm:px-4 ${
                isActive ? "text-white bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/10 shadow-[inset_0_1px_4px_rgba(255,255,255,0.2)]" : "text-gray-500"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-500"}`} />
              <span className={`md:text-sm text-xs font-medium  ${isActive ? "text-white block" : "text-gray-500 hidden"}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;