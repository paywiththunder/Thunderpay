/**
 * Shared bits for the email-verification detour.
 *
 * /auth/verify-number is reached from two places — straight after signup, and
 * after a login attempt on an account that never verified its email. Both write
 * the pending email under one key so the verify page has something to submit.
 */

/** Single source of truth for "the email currently awaiting an OTP". */
const PENDING_EMAIL_KEY = "pendingVerificationEmail";

/** Older builds sitting in a user's browser still wrote this one. */
const LEGACY_EMAIL_KEY = "signupEmail";

export const setPendingVerificationEmail = (email: string) => {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
};

export const readPendingVerificationEmail = () =>
    localStorage.getItem(PENDING_EMAIL_KEY) ?? localStorage.getItem(LEGACY_EMAIL_KEY);

export const clearPendingVerificationEmail = () => {
    localStorage.removeItem(PENDING_EMAIL_KEY);
    localStorage.removeItem(LEGACY_EMAIL_KEY);
};

/**
 * Does this failed POST /auth/login mean "credentials fine, email unverified"?
 *
 * Deliberately tolerant of several response shapes because the backend's exact
 * contract for this case isn't pinned down yet — tighten it to the real one.
 */
export const isEmailNotVerifiedError = (err: any): boolean => {
    const data = err?.response?.data;

    const code = data?.code ?? data?.error;
    if (typeof code === "string" && code.toUpperCase().includes("NOT_VERIFIED")) {
        return true;
    }

    const description = data?.description ?? err?.message ?? "";
    return /verif/i.test(description);
};
