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

export interface BoltsHistoryData {
    pagination: {
        hasNext: boolean;
        totalPages: number;
        hasPrevious: boolean;
        isLast: boolean;
        isFirst: boolean;
        currentPage: number;
        totalItems: number;
        itemsPerPage: number;
    };
    transactions: BoltsTransaction[];
}

export interface BoltsHistoryResponse {
    statusCode: string;
    success: boolean;
    description: string;
    data: BoltsHistoryData;
    errors: any;
}

/**
 * Fetch the cashback/bolts balance for a specific currency
 * @param currencyId The ID of the currency (e.g., 3)
 */
export const getCashbackBalance = async (currencyId: number | string = 3): Promise<CashbackBalanceResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

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
export const getBoltsHistory = async (params: { currencyId?: number | string; page?: number; size?: number } = {}): Promise<BoltsHistoryResponse> => {
    const { currencyId = 3, page = 1, size = 10 } = params;
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

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
        console.error("Bolts History Error Details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            params: { currencyId, page, size }
        });
        throw error.response?.data || error.message;
    }
};
