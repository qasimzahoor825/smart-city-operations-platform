import { config } from "../../config";

export interface EmailValidationResult {
  /** Whether the provider actually ran (false when no key or network failure). */
  available: boolean;
  /** True when registration may proceed. */
  pass: boolean;
  detail: string;
}

const SKIPPED: EmailValidationResult = {
  available: false,
  pass: true,
  detail: "validation-disabled",
};

/**
 * Signup-time email deliverability check via Abstract API's Email Validation.
 * Fail-safe by design:
 *  - no API key configured  -> skipped (offline-safe)
 *  - provider/network error -> skipped, never blocks signup
 *  - DELIVERABLE or UNKNOWN -> pass
 *  - UNDELIVERABLE / RISKY  -> rejected so the OTP never goes to a dead inbox
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const apiKey = config.emailValidation.abstractApiKey;
  if (!apiKey) return SKIPPED;

  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.warn(`[email-validation] provider HTTP ${res.status} — skipping check`);
      return { available: false, pass: true, detail: `provider-http-${res.status}` };
    }
    const data = (await res.json()) as {
      is_valid_format?: { value?: boolean };
      deliverability?: string;
      is_disposable_email?: { value?: boolean };
    };
    const formatOk = data?.is_valid_format?.value === true;
    const disposable = data?.is_disposable_email?.value === true;
    const deliverability = String(data?.deliverability ?? "UNKNOWN");
    const pass =
      formatOk && !disposable && (deliverability === "DELIVERABLE" || deliverability === "UNKNOWN");

    console.log(
      `[email-validation] ${email} -> format=${formatOk} deliverability=${deliverability} disposable=${disposable}`,
    );
    return { available: true, pass, detail: deliverability };
  } catch (err) {
    console.warn("[email-validation] network error — skipping check", err);
    return { available: false, pass: true, detail: "network-error" };
  } finally {
    clearTimeout(timeout);
  }
}

export default validateEmail;