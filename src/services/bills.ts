import axios from "axios";

const API_URL = "https://aapi.paywiththunder.com/api/v1/bills";

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

export interface AirtimeQuotePayload {
    phone: string;
    purchaseAmount: number;
    sourceCurrencyTicker: string;
    walletId: number | string;
    baseCostCurrency: string;
    serviceId: string;
}

export interface AirtimeQuoteResponse {
    quoteReference: string;
    deductionAmount: number;
    deductionCurrency: string;
    exchangeRate: number;
    transactionFee: number;
    expiresAtTimestamp: string;
}

export const getAirtimeQuote = async (payload: AirtimeQuotePayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/airtime/quote`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Airtime Quote Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Airtime Quote Error:", error);
        throw error.response?.data || error.message;
    }
};

export interface BillExecutionPayload {
    quoteReference: string;
    pin: string | number;
}

export interface BillExecutionResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: {
        transactionReference: string;
        quoteReference: string;
        baseAmount: number;
        baseCurrency: string;
        debitedAmount: number;
        debitedCurrency: string;
        status: string;
        createdAt: string;
        completedAt: string;
    } | null;
    errors: any;
}

export const executeBillPayment = async (payload: BillExecutionPayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        console.log("Executing Bill Payment with Payload:", payload);
        const response = await axios.post(
            `${API_URL}/execute`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Bill Execution Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Bill Execution Error:", error);
        throw error.response?.data || error.message;
    }
};

export interface DataPlan {
    variation_code: string;
    name: string;
    variation_amount: string;
    fixedPrice: string;
}

export interface DataPlansResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: DataPlan[];
}

export interface DataQuotePayload {
    phone: string;
    billersCode: string;
    variationCode: string;
    purchaseAmount: number;
    sourceCurrencyTicker: string;
    walletId: number | string;
    baseCostCurrency: string;
    serviceId: string;
}

export const getDataQuote = async (payload: DataQuotePayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/data/quote`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Data Quote Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Data Quote Error:", error);
        throw error.response?.data || error.message;
    }
};

export const getDataPlans = async (provider: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(
            `${API_URL}/data/${provider.toUpperCase()}/plans`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Data Plans Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Fetch Data Plans Error:", error);
        throw error.response?.data || error.message;
    }
};

export const getTvPlans = async (provider: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(
            `${API_URL}/tv-cable/${provider.toUpperCase()}/plans`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("TV Plans Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Fetch TV Plans Error:", error);
        throw error.response?.data || error.message;
    }
};

export interface TvQuotePayload {
    serviceId: string;
    billersCode: string; // Decoder number
    variationCode: string; // Plan ID
    purchaseAmount: number;
    phone: string;
    quantity?: number; // Optional, defaults to 1 usually? User sent 2 in example.
    sourceCurrencyTicker: string;
    walletId: number | string;
    baseCostCurrency: string;
    subscription_type?: string; // "change" or "renew"
}

export const getTvQuote = async (payload: TvQuotePayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        // Assuming endpoint follows pattern /tv-cable/quote
        const response = await axios.post(
            `${API_URL}/tv-cable/quote`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("TV Quote Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("TV Quote Error:", error);
        throw error.response?.data || error.message;
    }
};
