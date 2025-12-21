import axios from "axios";

const API_URL = "https://aapi.paywiththunder.com/api/v1/wallets";

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
