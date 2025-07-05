// utils/validation/registerValidation.ts

export function registerValidation(input: {
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}) {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!input.email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!input.password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (!passwordRegex.test(input.password)) {
    errors.password =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol";
    isValid = false;
  }

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  if (!input.acceptedTerms) {
    errors.terms = "You must accept the terms";
    isValid = false;
  }

  return { isValid, errors };
}
