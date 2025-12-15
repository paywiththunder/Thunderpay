"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Thunderpay from "../../public/thunderpay.png";
import AnotherImage from "../../public/tap.png"; // add more demo images
import Phone from "../../public/phone.png";
import { useRouter } from "next/navigation";

export default function Home() {
  const images = [Thunderpay, AnotherImage]; // add all images here
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Automatically change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // 3000ms = 3 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-between py-10 px-6 relative overflow-x-hidden md:py-16 md:px-8">
      {/* Main illustration */}
      <div className="flex flex-col items-center z-10">
        <div className="w-full md:w-64 md:h-64 relative">
          {/* {currentIndex === 1 && (
            <Image
              alt="Phone"
              className="flex justify-end"
              width={150}
              height={40}
              src={Phone}
            />
          )} */}
          <Image
            width={384}
            height={519}
            src={images[currentIndex]}
            alt="TunderPay graphic"
            className="w-full object-contain stars"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-semibold text-center mb-3 mt-20">
          Welcome to Thunderpay
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-300 max-w-xs md:max-w-md text-sm md:text-base mb-6">
          Thunder brings your money together — from cash to crypto to
          cross-border transfers.
        </p>

        {/* Pagination dots */}
        <div className="flex space-x-2 mb-10 md:mb-16">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-4 h-2 rounded-full ${
                idx === currentIndex ? "bg-white w-6" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col items-center space-y-4 z-10">
        <button
          onClick={() => router.push("/auth/sign-up")}
          className="w-11/12 py-3 md:w-1/2 md:py-4 rounded-full bg-linear-to-b from-[#161616] to-[#0F0F0F] border border-white/20 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/auth/login")}
          className="w-11/12 py-3 md:w-1/2 md:py-4 rounded-full text-white font-medium text-lg bg-[#161616]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
