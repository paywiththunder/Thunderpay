/**
 * Tracks whether the signed-in user still owes the legacy KYC (NIN + BVN).
 *
 * The flag comes from the `hasCompletedLegacyKyc` field on the POST /auth/login
 * response, so it is written at login and read by the home-screen banner.
 */

const LEGACY_KYC_KEY = "hasCompletedLegacyKyc";

export const setHasCompletedLegacyKyc = (completed: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LEGACY_KYC_KEY, String(completed));
};

/**
 * Only an explicit "false" counts as pending. A missing key (older session,
 * or a login response without the field) keeps the banner hidden rather than
 * nagging users who may already be compliant.
 */
export const isLegacyKycPending = () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LEGACY_KYC_KEY) === "false";
};

export const clearLegacyKycFlag = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LEGACY_KYC_KEY);
};
