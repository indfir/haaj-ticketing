import { describe, it, expect, beforeEach } from "vitest";
import { signQrPayload, verifyQrPayload } from "./qr";

describe("QR Payload Signing & Verification", () => {
  const payload = {
    ticketCode: "HAAJ-A7K2-9QMD",
    eventId: "test-event-id",
    iat: 1700000000000,
  };

  it("should sign a payload and return a hex signature", () => {
    const sig = signQrPayload(payload);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should verify a valid signed payload", () => {
    const sig = signQrPayload(payload);
    const result = verifyQrPayload({ ...payload, sig });
    expect(result.valid).toBe(true);
  });

  it("should reject a tampered payload", () => {
    const sig = signQrPayload(payload);
    const result = verifyQrPayload({
      ...payload,
      ticketCode: "HAAJ-TAMPERED",
      sig,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Invalid signature");
  });

  it("should reject a payload with wrong signature", () => {
    const result = verifyQrPayload({
      ...payload,
      sig: "a".repeat(64),
    });
    expect(result.valid).toBe(false);
  });

  it("should reject a payload from a different event", () => {
    const sig = signQrPayload(payload);
    const result = verifyQrPayload({
      ...payload,
      eventId: "different-event",
      sig,
    });
    expect(result.valid).toBe(false);
  });

  it("should produce different signatures for different payloads", () => {
    const sig1 = signQrPayload(payload);
    const sig2 = signQrPayload({ ...payload, iat: payload.iat + 1 });
    expect(sig1).not.toBe(sig2);
  });
});
