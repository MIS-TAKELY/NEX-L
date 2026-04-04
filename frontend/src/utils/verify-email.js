export const verifyEmail = (email) => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

/** Digits/spaces/dashes/plus/parens; min 8 digit chars (E.164-friendly for local forms). */
export function verifyPhoneOptional(phone) {
  if (typeof phone !== "string") return true;
  const t = phone.trim();
  if (!t) return true;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
