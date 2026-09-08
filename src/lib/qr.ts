import crypto from "crypto";

const HMAC_SECRET = process.env.HMAC_SECRET ?? "dev-hmac-secret";

export function signQrPayload(payload: Record<string, unknown>): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", HMAC_SECRET);
  hmac.update(data);
  return hmac.digest("hex");
}

export function verifyQrPayload(signed: {
  ticketCode: string;
  eventId: string;
  iat: number;
  sig: string;
}): { valid: boolean; reason?: string } {
  const { sig, ...payload } = signed;

  const expected = signQrPayload(payload);

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { valid: false, reason: "Invalid signature — tampered or foreign QR" };
  }

  return { valid: true };
}
