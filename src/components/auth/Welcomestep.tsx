"use client";
import Image from "next/image";
import LockImg from "../../../public/lock.png";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import Link from "next/link";

export default function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-6 w-full">
        <Link
          href="/"
          className="p-3 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F]  text-[1.2rem] border border-white/20"
        >
          <MdOutlineKeyboardDoubleArrowLeft />
        </Link>
        <Link href="/auth/login" className="text-blue-500 text-sm font-medium">
          Sign In
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
        <Image
          src={LockImg}
          alt="Lock"
          width={350}
          height={350}
          className="mb-10"
        />
        <h1 className="text-2xl font-semibold text-center mt-6">
          Set your all-in-one Thunder PIN
        </h1>
        <p className="text-gray-400 text-center mt-2">
          Quick, secure access to everything you do on Thunder.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-white text-black py-3 rounded-xl font-semibold"
      >
        Continue
      </button>
    </div>
  );
}
