/**
 * Validarea anterioară testa dacă adresa *conține* un caracter special, ceea ce
 * accepta „!!!" și respingea „ana@x.ro". Regula de mai jos cere structura reală
 * a unei adrese; verificarea definitivă rămâne cea de pe server.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function validateEmail(email) {
  return EMAIL_RE.test(String(email ?? '').trim());
}

/** Aceleași reguli ca schema Zod din backend, ca mesajele să nu se contrazică */
export function validatePassword(password) {
  const value = String(password ?? '');
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

/** Cerințele neîndeplinite, pentru indicatorul de sub câmpul de parolă. */
export function passwordChecks(password) {
  const value = String(password ?? '');
  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value)
  };
}

/** Luhn — prinde cifrele inversate și greșelile de tastare. */
export function validateCardNumber(cardNumber) {
  const digits = String(cardNumber ?? '').replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export const cardLast4 = (cardNumber) =>
  String(cardNumber ?? '').replace(/\D/g, '').slice(-4);

/** Grupare în blocuri de 4 în timpul tastării. */
export const formatCardNumber = (value) =>
  String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

/** Numele afișat lângă o recenzie, când utilizatorul nu mai există. */
export const displayName = (user, fallback) =>
  user?.fullName?.trim() || fallback;
