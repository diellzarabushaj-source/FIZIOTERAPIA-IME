import { PHYSIO_MONTHLY_PRICE_EUR } from "@/lib/billing";

export const PAYMENT_PROOF_BUCKET = "payment-proofs";
export const PAYMENT_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const PAYMENT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

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
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FI-${year}${month}-${suffix}-${random}`;
}

export function safeProofExtension(file: File) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}
