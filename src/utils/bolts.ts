/**
 * Bolt figures as reported by a bill quote.
 *
 * Every bill quote response carries `bonusAvailable` and `boltsEarnable`. Each
 * pay-bills flow used to derive these itself — from the selected plan, or from a
 * helper hardcoded to 0 — so the same screen showed different numbers depending
 * on which bill you were paying. These read the quote, which is authoritative.
 */

/** Quotes send these as numbers, but tolerate strings and nulls. */
const toBolts = (value: unknown) => Number(value) || 0;

export const boltsAvailableFrom = (quote: any) => toBolts(quote?.bonusAvailable);

export const boltsToEarnFrom = (quote: any) => toBolts(quote?.boltsEarnable);

/** The bolt rows shown on every bill confirmation screen, in a fixed order. */
export const boltQuoteRows = (quote: any) => [
    { label: "Bolts Available", value: `${boltsAvailableFrom(quote).toFixed(2)} Bolts` },
    { label: "Bolts to Earn", value: `${boltsToEarnFrom(quote).toFixed(2)} Bolts` },
];
