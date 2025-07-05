export function loginValidation({ email, password }: { email: string; password: string }) {
  const errors = { email: "", password: "" };
  let isValid = true;

  if (!email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!passwordRegex.test(password)) {
    errors.password = "Invalid credentials";
    isValid = false;
  }

  return { isValid, errors };
}
