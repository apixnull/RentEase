import { useState, useRef, useEffect, useCallback } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GenericButton } from "@/components/shared/GenericButton";

export function VerifyOtpForm() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tokenId, setTokenId] = useState(() => searchParams.get("tokenId") || "");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!tokenId) {
      toast.error("Verification token missing");
      navigate("/*");
      return;
    }

    // Fetch email from backend by tokenId
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/auth/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Invalid or expired verification token");
          navigate("/*");
          return;
        }

        setEmail(data.email);
      } catch (err) {
        toast.error("Failed to fetch verification data");
        navigate("/*");
      }
    })();
  }, [tokenId, navigate]);

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const otpCode = otp.join("");
      if (otpCode.length !== 6) {
        toast.error("Please enter all 6 digits");
        return;
      }

      setLoading(true);

      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));

      try {
        const [response] = await Promise.all([
          fetch("http://localhost:4000/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokenId, otpCode }),
          }),
          minLoadingTime,
        ]);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify OTP");
        }

        toast.success("OTP verified successfully! Redirecting to login...");

        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
        
      } catch (err) {
        const errorMessage = (err as Error).message || "Verification failed";
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [tokenId, otp]
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d$/.test(value) && value !== "") return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input on digit entry
      if (value && index < 5) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        // Move focus to previous input on backspace
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasteData = e.clipboardData
        .getData("text/plain")
        .replace(/\D/g, "")
        .slice(0, 6);
      const newOtp = [...otp];

      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasteData[i] || "";
      }

      setOtp(newOtp);

      // Focus the last input that received a digit
      const lastIndex = Math.min(5, pasteData.length - 1);
      const lastInput = inputRefs.current[lastIndex];
      if (lastInput) {
        lastInput.focus();
      }
    },
    [otp]
  );

  const handleResend = useCallback(async () => {
  setResending(true);
  setCountdown(30);

  try {
    const response = await fetch("http://localhost:4000/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }

    // Update the tokenId in state AND URL
    const newTokenId = data.tokenId;
    setTokenId(newTokenId); // Update local state
    
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("tokenId", newTokenId);
    window.history.replaceState(null, "", `?${newSearchParams.toString()}`);

    toast.success("New verification code sent!");
  } catch (err) {
    toast.error((err as Error).message);
  } finally {
    setResending(false);
  }
}, [email]);


  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 w-full max-w-xs"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to your email
        </p>

        {email && (
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mt-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium truncate max-w-xs">
              {email}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="otp" className="mb-3 block text-center">
            Verification Code
          </Label>

          {/* OTP Boxes Container */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold bg-white border border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                aria-label={`Digit ${index + 1} of verification code`}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center mt-2">{error}</p>
        )}

        <GenericButton
          type="submit"
          variant="solid"
          color="primary"
          size="md"
          fullwidth
          shadow="lg"
          isLoading={loading}
          disabled={loading}
          loadingText="Verying..."
          spinnerColor="#ffffff"
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20"
        >
          Verify
        </GenericButton>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className={`text-sm transition-all ${
              countdown > 0
                ? "text-gray-400"
                : "text-muted-foreground hover:text-teal-600"
            }`}
          >
            {resending ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="h-4 w-4 rounded-full border border-teal-600 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Sending...
              </div>
            ) : countdown > 0 ? (
              <span className="flex items-center justify-center gap-1">
                Resend in{" "}
                <span className="font-mono font-bold">{countdown}s</span>
              </span>
            ) : (
              "Resend Code"
            )}
          </Button>
          {countdown > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Didn't receive the code? Check your spam folder
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
