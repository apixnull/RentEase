import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GenericButton } from "@/components/shared/GenericButton";

export function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [userRole, setUserRole] = useState<"tenant" | "landlord">("tenant");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(""); // Added email state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          role: userRole.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong during registration."
        );
      }

      toast.success("Account created! Please verify your email.");

      // ✅ Pass tokenId via URL, email via state (non-exposed)
      const queryParams = new URLSearchParams({
        tokenId: data.tokenId,
      }).toString();

      setTimeout(() => {
        navigate(`/auth/verify-email?${queryParams}`);
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password !== value) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details to get started
        </p>
      </div>

      <div className="grid gap-6">
        {/* Role Selection */}
        <div className="grid gap-3">
          <Label className="flex items-center gap-2 text-foreground/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            I am a
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserRole("tenant")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md border transition-all",
                userRole === "tenant"
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-input hover:bg-accent text-muted-foreground"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setUserRole("landlord")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md border transition-all",
                userRole === "landlord"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-input hover:bg-accent text-muted-foreground"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Landlord
            </button>
          </div>
        </div>

        {/* Email field */}
        <div className="grid gap-3">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-foreground/80"
          >
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 focus-visible:ring-teal-200 border-border/70"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="grid gap-3">
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-foreground/80"
          >
            <Lock className="h-4 w-4" />
            Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pl-10 focus-visible:ring-teal-200 border-border/70 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password field */}
        <div className="grid gap-3">
          <Label
            htmlFor="confirmPassword"
            className="flex items-center gap-2 text-foreground/80"
          >
            <Lock className="h-4 w-4" />
            Confirm Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={cn(
                "pl-10 focus-visible:ring-teal-200 border-border/70 pr-10",
                !passwordsMatch && "border-red-500 focus-visible:ring-red-200"
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="text-red-500 text-xs -mt-2 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3 mt-2">
          <button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className={cn(
              "mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all",
              acceptedTerms
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-input"
            )}
          >
            {acceptedTerms && <Check className="h-4 w-4" />}
          </button>
          <div className="text-sm text-left">
            <div className="font-normal">
              <span className="select-none">I agree to the </span>
              <a
                href="#"
                className="text-teal-600 hover:text-teal-800 transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </a>
              <span className="select-none"> and </span>
              <a
                href="#"
                className="text-teal-600 hover:text-teal-800 transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              By creating an account, you agree to our terms and privacy policy
            </p>
          </div>
        </div>

        {/* Submit button */}
        <div>
          <GenericButton
            type="submit"
            variant="solid"
            color="primary"
            size="md"
            fullwidth
            shadow="lg"
            isLoading={isLoading}
            disabled={isLoading || !passwordsMatch || !acceptedTerms}
            loadingText="Processing..."
            spinnerColor="#ffffff"
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20"
          >
            Register
          </GenericButton>
        </div>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          to={"/auth/login"}
          className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
        >
          Login
        </Link>
      </div>
    </form>
  );
}
