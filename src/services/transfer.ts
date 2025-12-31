import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/transfers`;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

export type TransferScope = "INTERNAL" | "EXTERNAL_WALLET" | "EXTERNAL_BANK";

export interface TransferQuotePayload {
    scope: TransferScope;
    walletId: number;
    amount: number;
    fixedSide: "SOURCE" | "RECIPIENT";
    network?: string; // required for EXTERNAL_WALLET
    toCurrencyId?: number; // required for EXTERNAL_WALLET
    recipientEmail?: string; // required for INTERNAL
    recipientAddress?: string; // required for EXTERNAL_WALLET
}

export interface TransferQuoteResponse {
    success: boolean;
    data: {
        quoteId: number;
        quoteReference?: string;
        rate: number;
        expiresAt: string;
        sourceDebitAmount: number;
        networkFee: number | null;
        internalFee: number;
        totalDebit: number;
    };
}

export interface TransferExecutionPayload {
    quoteReference: string; // This usually matches quoteId from quote response
    recipientIdentifier: string;
    pin: string;
}

export const getTransferQuote = async (payload: TransferQuotePayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        console.log("Sending Quote Request to:", `${API_URL}/quote`);
        console.log("Payload:", JSON.stringify(payload, null, 2));
        const response = await axios.post(`${API_URL}/quote`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Quote Response Success:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Quote Request Failed:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error.response?.data || error.message;
    }
};

export const executeTransfer = async (payload: TransferExecutionPayload) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/execute`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};
