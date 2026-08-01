import type { QueryClient } from "@tanstack/react-query";

/**
 * Query key prefixes holding balances or transaction history — everything that
 * a completed transaction makes out of date.
 *
 * `invalidateQueries` matches by prefix, so `["recentTransactions"]` also covers
 * `["recentTransactions", "CRYPTO"]`. The wallet keys are listed separately
 * because they're sibling prefixes, not children of one another.
 */
const MONEY_QUERY_KEYS = [
    "wallets",
    "walletsNgn",
    "walletsUsd",
    "recentTransactions",
    "allActivities",
    "cashbackBalance",
];

/**
 * Mark balances and history stale after money moves.
 *
 * This is what makes caching safe to enable: without it, a cached balance would
 * survive a transfer and show the pre-transaction figure.
 */
export const invalidateMoneyQueries = (queryClient: QueryClient) => {
    MONEY_QUERY_KEYS.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    });
};
