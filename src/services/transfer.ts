import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/transfers`;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

// Getting bank lists

export interface BankItem {
    id: string;
    name: string;
    code: string;
}

export const getBanksList = async (): Promise<BankItem[]> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/banks/list`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.data?.success) {
            return response.data.data as BankItem[];
        }
        throw new Error(response.data?.description || "Failed to fetch banks list");
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};


// Bank account verification

export interface VerifyAccountPayload {
    bankId: string;
    accountNumber: string;
}

export const verifyAccountNumber = async (payload: VerifyAccountPayload): Promise<string> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/verify-account-number`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data?.success) {
            return response.data.data as string; // account name
        }
        throw new Error(response.data?.description || "Account verification failed");
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};


// Transfer Quotes and Excute Transfer

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

// ─── Bank Transfer

export interface InitiateBankTransferPayload {
    walletId: number;
    recipientAccountNumber: string;
    bankCode: string;
    amount: number;
    pin: string;
    reason?: string;
    reference?: string;
}

export interface InitiateBankTransferResponse {
    reference: string;
    bankCode?: string;
    amount: number;
    recipientAccountNumber?: string;
    recipientAccountName?: string;
    amountMinor: number;
    status: string;
    direction?: string;
    providerTransferId?: string;
}

export const initiateBankTransfer = async (
    payload: InitiateBankTransferPayload
): Promise<InitiateBankTransferResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/to-bank/initiate`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data?.success) {
            console.log(response.data.data)
            return response.data.data as InitiateBankTransferResponse;
        }
        throw new Error(response.data?.description || "Transfer failed");
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ─── Thunder Transfer

export interface InitiateThunderTransferPayload {
    walletId: number;
    recipientAccountNumber: string;
    amount: number;
    pin: string;
    reason?: string;
    reference?: string;
}

export interface InitiateThunderTransferResponse {
    reference: string;
    amount: number;
    recipientAccountNumber?: string;
    recipientAccountName?: string;
    amountMinor: number;
    status: string;
    direction?: string;
    transactionId?: string;
}

export const initiateThunderTransfer = async (
    payload: InitiateThunderTransferPayload
): Promise<InitiateThunderTransferResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/thunder/initiate`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data?.success) {
            return response.data.data as InitiateThunderTransferResponse;
        }
        throw new Error(response.data?.description || "Thunder transfer failed");
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// ─── Crypto to NGN Transfer

export interface CryptoToNgnQuotePayload {
    walletId: number;
    network: string;
    sourceAmount: number;
    scope: "INTERNAL";
    recipientAccountNumber: string;
}

export interface CryptoToNgnQuoteResponse {
    description: string;
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
        recipientAmount: number;
    };
}

export const getCryptoToNgnQuote = async (
    payload: CryptoToNgnQuotePayload
): Promise<CryptoToNgnQuoteResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        console.log("🚀 Sending Crypto-NGN Quote Request to:", `${API_URL}/crypto-ngn/quote`);
        console.log("📤 Quote Request Payload:", JSON.stringify(payload, null, 2));
        
        const response = await axios.post(`${API_URL}/crypto-ngn/quote`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        
        console.log("✅ Crypto-NGN Quote Response Status:", response.status);
        console.log("✅ Crypto-NGN Quote Response Headers:", response.headers);
        console.log("✅ Crypto-NGN Quote Response Data:", JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error: any) {
        console.error("❌ Crypto-NGN Quote Request Failed:");
        console.error("  - Status:", error.response?.status);
        console.error("  - Status Text:", error.response?.statusText);
        console.error("  - Response Headers:", error.response?.headers);
        console.error("  - Response Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("  - Error Message:", error.message);
        console.error("  - Full Error Object:", JSON.stringify(error, null, 2));
        
        throw error.response?.data || error.message;
    }
};
