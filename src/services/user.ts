import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/users`;

const getAuthToken = () => {
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
        const response = await axios.post(
            `${API_URL}/reset-pin`,
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
        console.log(response.data);
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

export const getRecentTransactions = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.get(`${API_URL}/transactions/recent`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};
