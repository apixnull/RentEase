import { useRef, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";


type VerifyOtpFormProps = {
  loading: boolean;
  resending: boolean;
  countdown: number;
  otp: string[];
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onResend: () => void;
};

export function VerifyOtpForm({
  loading,
  resending,
  countdown,
  otp,
  error,
  onSubmit,
  onChange,
  onKeyDown,
  onPaste,
  onResend,
}: VerifyOtpFormProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-xs">
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
                onChange={(e) => onChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(index, e)}
                onPaste={onPaste}
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Verifying...
              </motion.span>
            </div>
          ) : (
            "Verify Code"
          )}
          
          {/* Animated background */}
          {loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-700 to-blue-700"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          )}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onResend}
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
                <span className="font-mono font-bold">
                  {countdown}s
                </span>
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