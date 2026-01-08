import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/wallets`;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

export const createWallet = async (currencyId: number, network: string) => {
    const token = getAuthToken();
    console.log(token);
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            API_URL,
            {
                currencyId,
                network,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Payload sent:", { currencyId, network });
        console.log(response);
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw error.response?.data || error.message;
    }
};

export const getWallets = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const getWalletsUsd = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/usd`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("USD Wallets Response:", response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const getCurrencies = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/currencies`, {
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

export const getWalletActivity = async (walletId: number) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/${walletId}/activity`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        // Return null or empty representation on error to prevent failing all requests
        console.error(`Failed to fetch activity for wallet ${walletId}:`, error);
        return { success: false, data: { items: [] } };
    }
};
