import { config } from "../../config";

/** Normalize a phone number to digits only (Fast2SMS expects 10-digit national / 12-digit with 91/92 prefix). */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && (digits.length === 11 || digits.length === 10)) {
    digits = digits.slice(1);
  }
  return digits;
}

export interface SmsResult {
  sent: boolean;
  provider: "fast2sms" | "mock";
  requestId?: string;
  message?: string;
}

/**
 * Fast2SMS OTP endpoint (official dev API):
 *   GET https://www.fast2sms.com/dev/bulkV2
 *     ?authorization=<KEY>
 *     &route=otp
 *     &variables_values=<OTP>
 *     &flash=0
 *     &numbers=<comma-separated mobiles>
 *     &sender_id=<SENDER ID>
 */
export async function sendSmsOtp(phone: string, otp: string): Promise<SmsResult> {
  const { apiKey, senderId } = config.sms.fast2sms;
  const number = normalizePhone(phone);

  if (!apiKey) {
    // No credentials configured — print the OTP so the demo still works.
    // eslint-disable-next-line no-console
    console.log(`[sms:mock] OTP for ${number}: ${otp}`);
    return { sent: false, provider: "mock" };
  }

  const params = new URLSearchParams({
    authorization: apiKey,
    route: "otp",
    variables_values: otp,
    flash: "0",
    numbers: number,
  });
  // Fast2SMS default sender id is "FSTSMS"; override via .env if you have a registered one.
  params.set("sender_id", senderId || "FSTSMS");

  try {
    const res = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`);
    const json = (await res.json()) as {
      return?: boolean;
      request_id?: string;
      message?: string;
    };
    const sent = json?.return === true;
    // eslint-disable-next-line no-console
    console.log(`[sms:fast2sms] ${res.status} sent=${sent} ${JSON.stringify(json)}`);
    return { sent, provider: "fast2sms", requestId: json?.request_id, message: json?.message };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[sms:fast2sms] failed for ${number}:`, (err as Error).message);
    return { sent: false, provider: "fast2sms", message: (err as Error).message };
  }
}

export const sms = { sendOtp: sendSmsOtp, normalize: normalizePhone };
export default sms;