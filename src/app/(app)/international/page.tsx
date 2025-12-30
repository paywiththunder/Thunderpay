"use client";
import React from "react";
import InternationalPage from "@/components/main/InternationalPage";

export default function Page() {
    return (
        <div className="h-screen text-white flex flex-col items-center justify-between py-10 px-6 relative overflow-x-hidden md:py-16 md:px-8">
            <InternationalPage />
        </div>
    );
}
