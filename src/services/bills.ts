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
    pin: number;
}

export interface BillExecutionResponse {
    transactionReference: string;
    quoteReference: string;
    baseAmount: number;
    baseCurrency: string;
    debitedAmount: number;
    debitedCurrency: string;
    status: string;
    createdAt: string;
    completedAt: string;
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
