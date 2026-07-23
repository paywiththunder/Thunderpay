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
    currency: string;
    account: {
        code: string;
        number: string;
    };
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
            return response.data.data?.accountName || ""; // Extract accountName from data
        }
        throw new Error(response.data?.description || "Account verification failed");
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export interface VerifyInternalAccountPayload {
    bankId: string;
    accountNumber: string;
}

export const verifyInternalAccountNumber = async (payload: VerifyInternalAccountPayload): Promise<string> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/verify-internal-account-number`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data?.success) {
            return response.data.data?.accountName || ""; // Extract accountName from data
        }
        throw new Error(response.data?.description || "Internal account verification failed");
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
        const response = await axios.post(`${API_URL}/quote`, payload, {
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
    senderAccountNumber: string;
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
    senderAccountNumber: string;
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
    targetAmount: number;  // Changed to targetAmount as requested
    scope: "INTERNAL" | "EXTERNAL_BANK";
    recipientAccountNumber: string;
}

export interface CryptoToNgnQuoteResponse {
    description: string;
    success: boolean;
    data: {
        quoteReference: string;
        rate: number;
        expiresAt: string;
        expiresAtTimestamp?: string; // Added based on your quote response
        targetAmount: number;
        sourceCurrency: string;
        targetCurrency: string;
        estimatedPayoutNgn: number;
        estimatedNgnBeforeFee: number;
        platformFeeNgn: number;
        transactionFee?: number; // Added based on your quote response
        exchangeRate?: number; // Added based on your quote response
        amountIfFullCashbackApplied?: number; // Added based on your quote response
        boltsEarnable?: number; // Added based on your quote response
        bonusAvailable?: number; // Added based on your quote response
        deductionAmount?: number; // Added based on your quote response
        deductionCurrency?: string; // Added based on your quote response
        maxCashbackApplicable?: number; // Added based on your quote response
    };
}

export const getCryptoToNgnQuote = async (
    payload: CryptoToNgnQuotePayload
): Promise<CryptoToNgnQuoteResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/crypto-ngn/quote`, payload, {
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

// ─── Crypto to NGN Execute Transfer

export interface CryptoToNgnExecutePayload {
    quoteReference: string;
    // scope: "INTERNAL" | "EXTERNAL_BANK";
    // recipientAccountNumber: string;
    bankCode?: string; // Required for EXTERNAL_BANK
    reason?: string;
    pin: string;
}

export interface CryptoToNgnExecuteResponse {
    success: boolean;
    description: string;
    data: {
        transactionReference: string;
        status: string;
        amount?: number;
        recipientAccountNumber?: string;
        recipientAccountName?: string;
        [key: string]: any; // Allow for additional fields
    };
}

export const executeCryptoToNgnTransfer = async (
    payload: CryptoToNgnExecutePayload
): Promise<CryptoToNgnExecuteResponse> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(`${API_URL}/crypto-ngn/execute`, payload, {
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
