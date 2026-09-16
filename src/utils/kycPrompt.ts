const KYC_TIER_1_DISMISSED_KEY = "kycTier1PromptDismissed";

export const getKycStatus = (user: any): string => {
  if (!user) return "";

  return (
    user.kycStatus ||
    user.verificationStatus ||
    user.kyc?.status ||
    user.kycStatusCode ||
    ""
  );
};

export const isKycRejected = (status?: string | null) => {
  if (!status) return false;

  const normalized = status.toString().toUpperCase();
  return ["REJECTED", "DECLINED", "FAILED"].includes(normalized);
};

export const isKycInProgressOrApproved = (status?: string | null) => {
  if (!status) return false;

  const normalized = status.toString().toUpperCase();
  return [
    "APPROVED",
    "VERIFIED",
    "SUCCESS",
    "COMPLETED",
    "PENDING",
    "SUBMITTED",
    "IN_REVIEW",
    "UNDER_REVIEW",
    "PROCESSING",
  ].includes(normalized);
};

export const getKycTier1PromptDismissed = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KYC_TIER_1_DISMISSED_KEY) === "true";
};

export const setKycTier1PromptDismissed = (dismissed: boolean) => {
  if (typeof window === "undefined") return;

  if (dismissed) {
    localStorage.setItem(KYC_TIER_1_DISMISSED_KEY, "true");
    return;
  }

  localStorage.removeItem(KYC_TIER_1_DISMISSED_KEY);
};

export const shouldShowKycTier1Prompt = (user: any) => {
  if (!user || typeof window === "undefined") return false;

  const tier = Number(user.accountTier ?? 1);
  if (tier > 1) return false;

  const status = getKycStatus(user);

  if (isKycRejected(status)) {
    setKycTier1PromptDismissed(false);
    return true;
  }

  if (isKycInProgressOrApproved(status)) {
    setKycTier1PromptDismissed(true);
    return false;
  }

  return !getKycTier1PromptDismissed();
};
