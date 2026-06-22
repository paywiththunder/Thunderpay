"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrencies } from "@/services/wallet";

interface CurrencyContextType {
  ngnCurrencyId: number | null;
  isLoading: boolean;
  error: Error | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [ngnCurrencyId, setNgnCurrencyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNGNCurrency = async () => {
      try {
        const response = await getCurrencies();
        const currencies = response.data || [];
        const ngnCurrency = currencies.find(
          (currency: any) => currency.code?.toLowerCase() === "ngn"
        );

        if (ngnCurrency) {
          setNgnCurrencyId(ngnCurrency.currencyId);
          console.log("NGN currency ID initialized:", ngnCurrency.currencyId);
        } else {
          console.warn("NGN currency not found in response");
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch currencies");
        setError(error);
        console.error("Failed to fetch currencies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNGNCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ ngnCurrencyId, isLoading, error }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
