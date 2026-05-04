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
        console.log("📤 ===== TRANSFER QUOTE REQUEST =====");
        console.log("📤 API Endpoint: /transfers/quote");
        console.log("📤 Request Method: POST");
        console.log("📤 Payload Details:");
        console.log("  - scope:", payload.scope, "(type:", typeof payload.scope, ")");
        console.log("  - walletId:", payload.walletId, "(type:", typeof payload.walletId, ")");
        console.log("  - amount:", payload.amount, "(type:", typeof payload.amount, ")");
        console.log("  - fixedSide:", payload.fixedSide, "(type:", typeof payload.fixedSide, ")");
        if (payload.network) console.log("  - network:", payload.network, "(type:", typeof payload.network, ")");
        if (payload.toCurrencyId) console.log("  - toCurrencyId:", payload.toCurrencyId, "(type:", typeof payload.toCurrencyId, ")");
        if (payload.recipientEmail) console.log("  - recipientEmail:", payload.recipientEmail, "(type:", typeof payload.recipientEmail, ")");
        if (payload.recipientAddress) console.log("  - recipientAddress:", payload.recipientAddress, "(type:", typeof payload.recipientAddress, ")");
        console.log("📤 Full JSON Payload:", JSON.stringify(payload, null, 2));
        console.log("📤 Timestamp:", new Date().toISOString());

        const response = await axios.post(`${API_URL}/quote`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        
        console.log("📥 ===== TRANSFER QUOTE RESPONSE =====");
        console.log("📥 Success:", response.data.success);
        console.log("📥 Description:", response.data.description);
        console.log("📥 Response Timestamp:", new Date().toISOString());
        console.log("📥 Full Response Object:", JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.data) {
            console.log("✅ ===== QUOTE DETAILS =====");
            console.log("  - Quote ID:", response.data.data.quoteId);
            console.log("  - Quote Reference:", response.data.data.quoteReference);
            console.log("  - Rate:", response.data.data.rate);
            console.log("  - Source Debit Amount:", response.data.data.sourceDebitAmount);
            console.log("  - Network Fee:", response.data.data.networkFee);
            console.log("  - Internal Fee:", response.data.data.internalFee);
            console.log("  - Total Debit:", response.data.data.totalDebit);
            console.log("  - Expires At:", response.data.data.expiresAt);
        }
        
        return response.data;
    } catch (error: any) {
        console.error("❌ ===== QUOTE REQUEST FAILED =====");
        console.error("❌ Error Type:", error.constructor.name);
        console.error("❌ Error Message:", error?.message);
        console.error("❌ Error Description:", error?.description);
        console.error("❌ HTTP Status:", error?.response?.status);
        console.error("❌ Response Data:", error?.response?.data);
        console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
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
        console.log("📤 ===== BANK TRANSFER REQUEST =====");
        console.log("📤 API Endpoint: /transfers/to-bank/initiate");
        console.log("📤 Request Method: POST");
        console.log("📤 Payload Details:");
        console.log("  - walletId:", payload.walletId, "(type:", typeof payload.walletId, ")");
        console.log("  - recipientAccountNumber:", payload.recipientAccountNumber, "(type:", typeof payload.recipientAccountNumber, ")");
        console.log("  - bankCode:", payload.bankCode, "(type:", typeof payload.bankCode, ")");
        console.log("  - amount:", payload.amount, "(type:", typeof payload.amount, ")");
        if (payload.reason) console.log("  - reason:", payload.reason, "(type:", typeof payload.reason, ")");
        if (payload.reference) console.log("  - reference:", payload.reference, "(type:", typeof payload.reference, ")");
        console.log("📤 Full JSON Payload:", JSON.stringify(payload, null, 2));
        console.log("📤 Timestamp:", new Date().toISOString());

        const response = await axios.post(`${API_URL}/to-bank/initiate`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (response.data?.success) {
            console.log("📥 ===== BANK TRANSFER RESPONSE =====");
            console.log("📥 Success:", response.data.success);
            console.log("📥 Description:", response.data.description);
            console.log("📥 Response Timestamp:", new Date().toISOString());
            console.log("📥 Full Response Object:", JSON.stringify(response.data, null, 2));
            
            if (response.data.data) {
                console.log("✅ ===== TRANSFER DETAILS =====");
                console.log("  - Reference:", response.data.data.reference);
                console.log("  - Amount:", response.data.data.amount);
                console.log("  - Amount Minor:", response.data.data.amountMinor);
                console.log("  - Status:", response.data.data.status);
                if (response.data.data.recipientAccountName) console.log("  - Recipient Account Name:", response.data.data.recipientAccountName);
                if (response.data.data.bankCode) console.log("  - Bank Code:", response.data.data.bankCode);
                if (response.data.data.providerTransferId) console.log("  - Provider Transfer ID:", response.data.data.providerTransferId);
            }
            
            return response.data.data as InitiateBankTransferResponse;
        }
        throw new Error(response.data?.description || "Transfer failed");
    } catch (error: any) {
        console.error("❌ ===== BANK TRANSFER FAILED =====");
        console.error("❌ Error Type:", error.constructor.name);
        console.error("❌ Error Message:", error?.message);
        console.error("❌ Error Description:", error?.description);
        console.error("❌ HTTP Status:", error?.response?.status);
        console.error("❌ Response Data:", error?.response?.data);
        console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
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
        console.log("📤 ===== THUNDER TRANSFER REQUEST =====");
        console.log("📤 API Endpoint: /transfers/thunder/initiate");
        console.log("📤 Request Method: POST");
        console.log("📤 Payload Details:");
        console.log("  - walletId:", payload.walletId, "(type:", typeof payload.walletId, ")");
        console.log("  - recipientAccountNumber:", payload.recipientAccountNumber, "(type:", typeof payload.recipientAccountNumber, ")");
        console.log("  - amount:", payload.amount, "(type:", typeof payload.amount, ")");
        if (payload.reason) console.log("  - reason:", payload.reason, "(type:", typeof payload.reason, ")");
        if (payload.reference) console.log("  - reference:", payload.reference, "(type:", typeof payload.reference, ")");
        console.log("📤 Full JSON Payload:", JSON.stringify(payload, null, 2));
        console.log("📤 Timestamp:", new Date().toISOString());

        const response = await axios.post(`${API_URL}/thunder/initiate`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        
        if (response.data?.success) {
            console.log("📥 ===== THUNDER TRANSFER RESPONSE =====");
            console.log("📥 Success:", response.data.success);
            console.log("📥 Description:", response.data.description);
            console.log("📥 Response Timestamp:", new Date().toISOString());
            console.log("📥 Full Response Object:", JSON.stringify(response.data, null, 2));
            
            if (response.data.data) {
                console.log("✅ ===== TRANSFER DETAILS =====");
                console.log("  - Reference:", response.data.data.reference);
                console.log("  - Amount:", response.data.data.amount);
                console.log("  - Amount Minor:", response.data.data.amountMinor);
                console.log("  - Status:", response.data.data.status);
                if (response.data.data.recipientAccountName) console.log("  - Recipient Account Name:", response.data.data.recipientAccountName);
                if (response.data.data.transactionId) console.log("  - Transaction ID:", response.data.data.transactionId);
            }
            
            return response.data.data as InitiateThunderTransferResponse;
        }
        throw new Error(response.data?.description || "Thunder transfer failed");
    } catch (error: any) {
        console.error("❌ ===== THUNDER TRANSFER FAILED =====");
        console.error("❌ Error Type:", error.constructor.name);
        console.error("❌ Error Message:", error?.message);
        console.error("❌ Error Description:", error?.description);
        console.error("❌ HTTP Status:", error?.response?.status);
        console.error("❌ Response Data:", error?.response?.data);
        console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
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

        console.log("Crypto-NGN Quote Response:", response.data);

        return response.data;
    } catch (error: any) {
        console.error("Crypto-NGN Quote Request Failed:", error.response?.data || error.message);

        throw error.response?.data || error.message;
    }
};

// ─── Crypto to NGN Execute Transfer

export interface CryptoToNgnExecutePayload {
    quoteReference: string;
    scope: "INTERNAL" | "EXTERNAL_BANK";
    recipientAccountNumber: string;
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
        console.log("📤 ===== CRYPTO TO NGN EXECUTE REQUEST =====");
        console.log("📤 API Endpoint: /transfers/crypto-ngn/execute");
        console.log("📤 Request Method: POST");
        console.log("📤 Payload Details:");
        console.log("  - quoteReference:", payload.quoteReference);
        console.log("  - scope:", payload.scope);
        console.log("  - recipientAccountNumber:", payload.recipientAccountNumber);
        if (payload.bankCode) console.log("  - bankCode:", payload.bankCode);
        if (payload.reason) console.log("  - reason:", payload.reason);
        console.log("📤 Full JSON Payload:", JSON.stringify(payload, null, 2));
        console.log("📤 Timestamp:", new Date().toISOString());

        const response = await axios.post(`${API_URL}/crypto-ngn/execute`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("📥 ===== CRYPTO TO NGN EXECUTE RESPONSE =====");
        console.log("📥 Success:", response.data.success);
        console.log("📥 Description:", response.data.description);
        console.log("📥 Response Timestamp:", new Date().toISOString());
        console.log("📥 Full Response Object:", JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data) {
            console.log("✅ ===== TRANSFER EXECUTED SUCCESSFULLY =====");
            console.log("  - Transaction Reference:", response.data.data.transactionReference);
            console.log("  - Status:", response.data.data.status);
            if (response.data.data.amount) console.log("  - Amount:", response.data.data.amount);
            if (response.data.data.recipientAccountName) console.log("  - Recipient:", response.data.data.recipientAccountName);
        }

        return response.data;
    } catch (error: any) {
        console.error("❌ ===== CRYPTO TO NGN EXECUTE FAILED =====");
        console.error("❌ Error Type:", error.constructor.name);
        console.error("❌ Error Message:", error?.message);
        console.error("❌ Error Description:", error?.response?.data?.description);
        console.error("❌ HTTP Status:", error?.response?.status);
        console.error("❌ Response Data:", error?.response?.data);
        console.error("❌ Full Error Object:", JSON.stringify(error, null, 2));
        throw error.response?.data || error.message;
    }
};
