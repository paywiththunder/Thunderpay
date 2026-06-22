import axios from "axios";
import { API_BASE_URL } from "@/config";

const API_URL = `${API_BASE_URL}/auth`;

const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

export const forgotPassword = async (email: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/forgot-password`,
            { email },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const resetPassword = async (code: string, newPassword: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/reset-password`,
            { code, newPassword },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const response = await axios.post(
            `${API_URL}/change-password`,
            { currentPassword, newPassword },
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
