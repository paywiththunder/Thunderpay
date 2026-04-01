import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/providers/QueryProvider";
import { CurrencyProvider } from "@/providers/CurrencyProvider";

export const metadata: Metadata = {
  title: "Thunder",
  description: "Created by Musben",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black h-full">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-black h-full`}
      >
        <QueryProvider>
          <CurrencyProvider>
            {children}
            <Toaster position="top-center" />
          </CurrencyProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
