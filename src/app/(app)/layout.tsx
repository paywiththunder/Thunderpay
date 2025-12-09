import BottomNav from "@/components/main/BottomNav";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // max-w-md forces a mobile-view width on desktop screens
    <main className="flex flex-col bg-black bg-app-bg text-white mx-auto relative overflow-x-hidden">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </main>
  );
}