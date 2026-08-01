/**
 * One definition of what makes a password acceptable, shared by every screen
 * that creates or changes one.
 *
 * These are *composition* rules — they only apply where a password is being
 * chosen (signup, secure-account, reset). Never run them on the login screen:
 * that password already exists, and re-checking its shape client-side just
 * locks out anyone whose password predates the current rules.
 */

/**
 * Anything that isn't a letter or a digit counts as special.
 *
 * The old rule enumerated a fixed set and quietly rejected `- _ + = ; ' [ ] /
 * \ ~ ` £` and friends, which read to users as "my special character wasn't
 * accepted". Inverting the test means there is no longer any character the
 * form refuses.
 */
const SPECIAL = /[^A-Za-z0-9]/;

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
    text: string;
    ok: boolean;
    /** Shown underneath when the rule is unmet, so "special character" isn't a guessing game. */
    hint?: string;
};

export const passwordRules = (pw: string): PasswordRule[] => [
    {
        text: `At least ${PASSWORD_MIN_LENGTH} characters long`,
        ok: pw.length >= PASSWORD_MIN_LENGTH,
    },
    {
        text: "At least one lowercase letter",
        ok: /[a-z]/.test(pw),
        hint: "a–z",
    },
    {
        text: "At least one uppercase letter",
        ok: /[A-Z]/.test(pw),
        hint: "A–Z",
    },
    {
        text: "At least one number",
        ok: /\d/.test(pw),
        hint: "0–9",
    },
    {
        text: "At least one special character",
        ok: SPECIAL.test(pw),
        hint: "any character that isn't a letter or number — for example . , ! ? - _ @ # $ & *",
    },
];

export const isPasswordValid = (pw: string) => passwordRules(pw).every((r) => r.ok);
