import { getCurrencies } from "@/services/wallet";

let ngnCurrencyId: number | null;

/**
 * Fetch and cache the NGN currency ID
 * Call this once on app startup, then use getNGNCurrencyId() throughout
 */
export const initializeCurrencies = async (): Promise<number | null> => {
    if (ngnCurrencyId) return ngnCurrencyId;
    
    try {
        const response = await getCurrencies();
        console.log("Currencies response:", response);
        
        const currencies = response.data || [];
        const ngnCurrency = currencies.find(
            (currency: any) => currency.code?.toLowerCase() === "ngn"
        );
        
        if (ngnCurrency) {
            ngnCurrencyId = ngnCurrency.currencyId;
            console.log("NGN currency ID initialized:", ngnCurrencyId);
            return ngnCurrencyId;
        } else {
            console.warn("NGN currency not found in response");
        }
    } catch (error) {
        console.warn("Failed to fetch currencies:", error);
    }
    
    return ngnCurrencyId;
};

export const getNGNCurrencyId = (): number | null => {
    console.log("Retrieving NGN currency ID:", ngnCurrencyId);
    return ngnCurrencyId;
};
