"use client";

import { useEffect } from "react";
import { initializeCurrencies } from "@/utils/currencyUtils";

export default function CurrencyInitializer() {
  useEffect(() => {
    initializeCurrencies().catch(console.error);
  }, []);

  return null;
}
