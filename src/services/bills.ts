import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/bills`;

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

    const url = `${API_URL}/execute`;
    try {
        console.log(`Executing Bill Payment to ${url} with Payload:`, JSON.stringify(payload, null, 2));
        const response = await axios.post(
            url,
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
        console.error("Bill Execution Error Details:", {
            message: error.message,
            code: error.code,
            url: url,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            } : "No response received",
            request: error.request ? "Request was sent but no response" : "Request setup failed"
        });
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
    quantity: number;
    sourceCurrencyTicker: string;
    walletId: number | string;
    baseCostCurrency: string;
    subscription_type: "change" | "renew" | null; // Required: enum for DSTV/GOTV, null for others
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

export interface ElectricityQuotePayload {
    serviceId: string; // IKEDC, ikeja-electric, IBEDC, ibadan-electric, PHED, portharcourt-electric, KEDCO, kano-electric, AEDC, abuja-electric
    billersCode: string; // Meter number
    type: "prepaid" | "postpaid";
    purchaseAmount: number; // >= 2000
    phone: string;
    sourceCurrencyTicker: string;
    walletId: number | string;
    baseCostCurrency: string;
}

export interface ElectricityQuoteResponse {
    quoteReference: string;
    deductionAmount: number;
    deductionCurrency: string;
    exchangeRate: number;
    transactionFee: number;
    expiresAtTimestamp: string;
}

export const getElectricityQuote = async (payload: ElectricityQuotePayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/electricity/quote`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Electricity Quote Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Electricity Quote Error:", error);
        throw error.response?.data || error.message;
    }
};

export interface ElectricityVerificationPayload {
    serviceId: string;
    billersCode: string;
    type: "prepaid" | "postpaid";
}

export interface ElectricityVerificationResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: {
        verified: boolean;
        name: string;
        address?: string;
    } | null;
}

export const verifyElectricity = async (payload: ElectricityVerificationPayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const { serviceId, ...data } = payload;

    try {
        const response = await axios.post(
            `${API_URL}/electricity/${serviceId}/verify`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Electricity Verify Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Electricity Verify Error:", error);
        throw error.response?.data || error.message;
    }
};

export interface TvVerificationPayload {
    serviceId: string;
    billersCode: string;
}

export interface TvVerificationResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: {
        verified: boolean;
        name: string;
        error: any;
    } | null;
    errors: any;
}

export const verifyTv = async (payload: TvVerificationPayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    const { serviceId, billersCode } = payload;

    try {
        const response = await axios.post(
            `${API_URL}/tv-cable/${serviceId}/verify`,
            { billersCode },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("TV Verify Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("TV Verify Error:", error);
        throw error.response?.data || error.message;
    }
};
