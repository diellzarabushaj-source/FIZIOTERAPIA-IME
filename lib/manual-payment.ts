import { randomBytes } from "node:crypto";
import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";

export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const PAYMENT_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const PAYMENT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export type PaymentProofKind = "jpg" | "png" | "webp" | "pdf";

export function getBankDetails() {
  return {
    bankName: process.env.BANK_NAME || "Banka do të konfigurohet para launch-it",
    beneficiary: process.env.BANK_BENEFICIARY || "Fizioterapia Ime",
    iban: process.env.BANK_IBAN || "—",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "—",
    swift: process.env.BANK_SWIFT || "—",
    instructions:
      process.env.BANK_PAYMENT_INSTRUCTIONS ||
      "Në përshkrimin e pagesës shkruaje referencën unike që shfaqet në këtë faqe.",
  };
}

export function paymentAmountForMonths(months: number) {
  const safeMonths = Math.min(12, Math.max(1, Math.floor(months || 1)));
  return Number((PHYSIO_MONTHLY_PRICE_EUR * safeMonths).toFixed(2));
}

export function createPaymentReference(profileId: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = profileId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `FI-${year}${month}-${suffix}-${random}`;
}

export function detectPaymentProofKind(bytes: Uint8Array): PaymentProofKind | null {
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return "pdf";
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    return "webp";
  }
  return null;
}

export function mimeTypeForPaymentProof(kind: PaymentProofKind) {
  if (kind === "pdf") return "application/pdf";
  if (kind === "png") return "image/png";
  if (kind === "webp") return "image/webp";
  return "image/jpeg";
}

export function sanitizeProofFilename(value: string) {
  const base = value.split(/[\\/]/).pop() || "payment-proof";
  return base.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 180);
}
