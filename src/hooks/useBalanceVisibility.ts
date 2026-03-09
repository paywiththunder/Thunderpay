import { useState, useEffect } from "react";

export function useBalanceVisibility() {
    const [showBalance, setShowBalance] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("showBalance");
        if (stored !== null) {
            setShowBalance(stored === "true");
        }
    }, []);

    const toggleBalance = () => {
        const newValue = !showBalance;
        setShowBalance(newValue);
        localStorage.setItem("showBalance", String(newValue));
    };

    return { showBalance, toggleBalance };
}
