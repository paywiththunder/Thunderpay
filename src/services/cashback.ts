import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/cashback`;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};


export interface CashbackBalanceData {
    minimumRequired: number;
    totalEarned: number;
    amountGranted: number;
    pendingConversion: number;
    redeemed: number;
    canConvert: boolean;
    pointsRequired: number;
    currency: string;
    availableBolts: number;
    conversionRate: number;
}

export interface CashbackBalanceResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: CashbackBalanceData;
    errors: any;
}

export interface ConvertBoltsPayload {
    walletId: number | string;
    boltsToConvert: number;
}

export interface CashbackConvertData {
    amountCredited: number;
    newBoltsBalance: number;
    conversionReference: string;
    boltsConverted: number;
    currency: string;
}

export interface CashbackConvertResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: CashbackConvertData;
    errors: any;
}

export interface BoltsTransaction {
    id: number;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
    description: string;
    status: string;
    createdAt: string;
}

// Data returned by public conversion info endpoint
export interface BoltsConversionInfo {
    pointsRequired: number;
    amountGranted: number;
    minimumBoltsToConvert: number;
    currency: string;
    conversionRatePerBolt: number;
    description: string;
}

export interface BoltsConversionInfoResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: BoltsConversionInfo;
    errors: any;
}

export interface BoltsHistoryResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: {
        pagination: any;
        transactions: BoltsTransaction[];
    };
    errors: any;
}

/**
 * Fetch the cashback/bolts balance for a specific currency
 * @param currencyId The ID of the currency (required, pass from Context)
 */
export const getCashbackBalance = async (currencyId: number): Promise<CashbackBalanceResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    if (!currencyId) {
        throw new Error("Currency ID is required");
    }

    try {
        const response = await axios.get(`${API_URL}/bolts/balance`, {
            params: { currencyId },
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Cashback Balance Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Cashback Balance Error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Convert earned bolts/cashback to wallet balance
 * @param payload { walletId, boltsToConvert }
 */
export const convertBolts = async (payload: ConvertBoltsPayload): Promise<CashbackConvertResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/bolts/convert`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Convert Bolts Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Convert Bolts Error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Fetch the conversion/earning history for bolts
 * @param params { currencyId, page, size }
 */
export const getBoltsHistory = async (params: { currencyId: number; page?: number; size?: number }): Promise<BoltsHistoryResponse> => {
    const { currencyId, page = 0, size = 20 } = params;
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");
    
    if (!currencyId) {
        throw new Error("Currency ID is required");
    }

    try {
        const response = await axios.get(`${API_URL}/bolts/history`, {
            params: { currencyId, page, size },
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Bolts History Response:", response.data);
        return response.data;
    } catch (error: any) {
        // log the raw error plus structured info so we never print `{}`
        console.error("Bolts History Error Details raw:", error);
        console.error("Bolts History Error Details structured:", {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
            params: { currencyId, page, size }
        });
        throw error?.response?.data || error?.message || "Unknown error";
    }
};

/**
 * Fetch public bolts conversion information
 */
export const getConversionInfo = async (): Promise<BoltsConversionInfoResponse> => {
    // The server technically allows public access, but we send token if available for consistency
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await axios.get(`${API_URL}/bolts/conversion-info`, {
            headers,
        });
        return response.data;
    } catch (error: any) {
        console.error("Conversion Info Error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw error.response?.data || error.message;
    }
};
