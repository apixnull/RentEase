import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GenericButton } from "@/components/shared/GenericButton";
import { loginValidation } from "@/validations/auth/loginValidation";
import { loginRequest, resendOtpRequest } from "@/services/api/auth.api";
import useAuth  from "@/hooks/useAuth";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  // Add new state to track rate limit
  const [isRateLimited, setIsRateLimited] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRateLimited) {
      timer = setTimeout(() => setIsRateLimited(false), 15 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [isRateLimited]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (isRateLimited) return;
    setIsLoading(true);
    setErrors({ email: "", password: "" });

    const { isValid, errors: validationErrors } = loginValidation({
      email,
      password,
    });

    if (!isValid) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginRequest(email, password);
      const user = response.data.user;

      // ✅ Store user in Zustand
      login(user);
      
      toast.success("Login successful!", {
        description: `Welcome back, ${user.email.split("@")[0]}!`,
      });

      switch (user.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "LANDLORD":
          navigate("/landlord");
          break;
        case "TENANT":
          navigate("/tenant");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      const { status, data } = error.response || {};
      const message =
        data?.message || "Something went wrong. Please try again.";

      if (status === 403 && data?.errorCode) {
        switch (data.errorCode) {
          case "EMAIL_NOT_VERIFIED":
            toast.error(message);
            sessionStorage.setItem("verify_email", email);
            try {
              await resendOtpRequest(email);
              toast.success("Verification code resent!");
            } catch {
              toast.error("Failed to resend verification code.");
            }
            navigate("/auth/verify-email");
            break;
          case "ACCOUNT_DISABLED":
            toast.error(message);
            navigate("/disabled");
            break;
          default:
            toast.error(message);
        }
      } else if (status === 401) {
        toast.error(message);
      } else if (status === 429) {
        setIsRateLimited(true);
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="grid gap-6">
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
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              className={cn(
                "pl-10 focus-visible:ring-teal-200 border-border/70",
                errors.email && "border-red-500 focus:border-red-500"
              )}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs -mt-2">{errors.email}</p>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-foreground/80"
            >
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Link
              to="/auth/forget-password"
              className="ml-auto text-sm text-teal-600 hover:text-teal-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className={cn(
                "pl-10 focus-visible:ring-teal-200 border-border/70 pr-10",
                errors.password && "border-red-500 focus:border-red-500"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs -mt-2">{errors.password}</p>
          )}
        </div>

        <div>
          <GenericButton
            type="submit"
            variant="solid"
            color="primary"
            size="md"
            fullwidth
            shadow="lg"
            isLoading={isLoading}
            loadingText="Authenticating..."
            spinnerColor="#ffffff"
            disabled={isRateLimited}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20"
          >
            Login
          </GenericButton>
        </div>
      </div>

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}
