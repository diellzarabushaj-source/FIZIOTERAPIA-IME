const value = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
const errors = [];

if (!value) {
  errors.push("EXPO_PUBLIC_API_BASE_URL is required for mobile builds.");
} else {
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !local) {
      errors.push("EXPO_PUBLIC_API_BASE_URL must use HTTPS outside local development.");
    }
    if (url.username || url.password) {
      errors.push("EXPO_PUBLIC_API_BASE_URL must not contain credentials.");
    }
    if (url.search || url.hash) {
      errors.push("EXPO_PUBLIC_API_BASE_URL must not contain query parameters or fragments.");
    }
  } catch {
    errors.push("EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }
}

if (errors.length) {
  console.error("Mobile environment validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Mobile environment validation passed.");
