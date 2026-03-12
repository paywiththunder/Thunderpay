import axios from "axios";
import { API_BASE_URL } from "@/config";
import { getAuthToken } from "./user";

const API_URL = `${API_BASE_URL}/ambassador`;

export interface AmbassadorApplication {
    id: number;
    userId: number | null;
    reviewerId: number | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string | null;
    createdAt: string;
    updatedAt: string;
    decidedAt: string | null;
}

export const applyForAmbassador = async (
    reason?: string
): Promise<any> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const res = await axios.post(
            `${API_URL}/applications`,
            reason ? { reason } : {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data as AmbassadorApplication;
    } catch (err: any) {
        // propagate server message or generic
        throw err.response?.data || err.message;
    }
};

export const getAmbassadorApplications = async (): Promise<any> => {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found");

    try {
        const res = await axios.get(`${API_URL}/applications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data as AmbassadorApplication[];
    } catch (err: any) {
        throw err.response?.data || err.message;
    }
};
