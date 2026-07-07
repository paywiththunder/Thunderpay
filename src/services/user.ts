import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/users`;
const API_URL2 = `${API_BASE_URL}`;


export const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

export const setPin = async (pin: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/set-pin`,
            {
                pin,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const resetPin = async (pin: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const body = pin === "" ? {} : { pin };

        const response = await axios.post(
            `${API_URL}/reset-pin`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log('Reset PIN response:', response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const verifyResetPin = async (code: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/reset-pin/verify`,
            {
                code,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log('Verify Reset PIN response:', response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const getUserProfile = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export interface GetRecentTransactionsParams {
    walletType?: "FIAT" | "fiat" | "CRYPTO" | "crypto";
    page?: string | number;
    size?: string | number;
}

export const getRecentTransactions = async (params?: GetRecentTransactionsParams) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/transactions/recent`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: params,
        });
        console.log(response.data)
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

// --------------------------------------------------------------------
// referrals
// --------------------------------------------------------------------

export interface Referral {
    referredUserId: number;
    name: string | null;
    email: string | null;
    qualified: boolean;
    totalSpendUsd: number;
    totalSpendNgn: number;
    referredAt: string;
    qualifiedAt: string | null;
}

export const getReferrals = async (): Promise<any> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const res = await axios.get(`${API_URL2}/referrals`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data as Referral[];
    } catch (err: any) {
        throw err.response?.data || err.message;
    }
};

// --------------------------------------------------------------------
// KYC
// --------------------------------------------------------------------

export enum DocumentType {
    DriversLicense = "DRIVERS_LICENSE",
    NationalID = "NATIONAL_ID",
    Passport = "PASSPORT",
    VotersCard = "VOTERS_CARD",
}

export interface KycTier2SubmitParams {
    documentNumber: string;
    documentType: DocumentType;
}

export interface KycTier2FormData {
    documentImage?: File;
    selfieImage?: File;
}

export const getKycConfigs = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/kyc-configs`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const submitKycTier2 = async (
    params: KycTier2SubmitParams,
    formData: KycTier2FormData
) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const form = new FormData();
        
        // Add images if provided
        if (formData.documentImage) {
            form.append("documentImage", formData.documentImage);
        }
        if (formData.selfieImage) {
            form.append("selfieImage", formData.selfieImage);
        }

        const response = await axios.post(
            `${API_URL}/kyc/tier2/submit`,
            form,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type - axios will set it automatically with boundary for FormData
                },
                params: {
                    documentType: params.documentType,
                    documentNumber: params.documentNumber,
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};
