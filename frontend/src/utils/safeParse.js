// frontend/src/utils/safeParse.js
export default function safeParse(val, fallback = null) {
  try {
    if (typeof val !== "string") return val ?? fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
