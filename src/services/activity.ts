import { parseISO } from "date-fns";

import { getWallets, getWalletActivity } from "./wallet";

export interface ActivityItem {
    id: number;
    source: string;
    direction: "CREDIT" | "DEBIT" | string;
    amount: number;
    fee: number | null;
    status: string;
    reference: string;
    walletId: number | null;
    fromAddress: string | null;
    toAddress: string | null;
    createdAt: string | null;
    details?: Record<string, any>;
}

const timeOf = (createdAt: string | null) => {
    if (!createdAt) return 0;

    const date = parseISO(createdAt);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

/**
 * Every wallet's activity, deduplicated by reference and newest first.
 *
 * Shared by the activity list and the transaction detail page under the one
 * `["allActivities"]` key, so opening a transaction reads what the list already
 * fetched instead of re-requesting every wallet's activity again.
 */
export const fetchAllActivities = async (): Promise<ActivityItem[]> => {
    const walletsResponse = await getWallets();
    const wallets = Array.isArray(walletsResponse)
        ? walletsResponse
        : walletsResponse.data || [];

    if (wallets.length === 0) return [];

    const validWallets = wallets.filter((wallet: any) => wallet.walletId);
    const responses = await Promise.all(
        validWallets.map((wallet: any) => getWalletActivity(wallet.walletId))
    );

    const items: ActivityItem[] = [];
    responses.forEach((response) => {
        if (response && response.success && Array.isArray(response.data?.items)) {
            items.push(...response.data.items);
        }
    });

    return Array.from(new Map(items.map((item) => [item.reference, item])).values()).sort(
        (a, b) => timeOf(b.createdAt) - timeOf(a.createdAt)
    );
};
