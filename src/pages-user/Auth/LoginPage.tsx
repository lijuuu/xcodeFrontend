import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { loginUser, clearAuthState, setAuthLoading, resendEmail } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Loader1 from "@/components/ui/loader1";
import SimpleHeader from "@/components/sub/AuthHeader";
import axios from "axios";
import { handleError, handleInfo } from "@/components/sub/ErrorToast";

// --- Form Schema ---
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have uppercase, lowercase, number, and special character"
    )
    .max(20, "Password must be less than 20 characters"),
  code: z.string().min(6, "Code must be 6 characters").optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 mr-10 text-[#3CE7B2]" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Logging in...
    </div>
    <button
      onClick={onCancel}
      className="text-gray-400 text-sm font-coinbase-sans mt-4 underline hover:text-[#3CE7B2] transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
);

// --- LoginForm Component ---
function LoginForm({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { error, loading, userProfile, successMessage, isAuthenticated } = useSelector((state: any) => state.auth);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Watch the email field from the form
  const formEmail = watch("email");

  const onSubmit = (data: LoginFormData) => {
    console.log("Form Data:", data);
    dispatch(loginUser(data) as any);
  };

  // Single useEffect for auth state and navigation
  useEffect(() => {
    console.log("Auth State:", { error, loading, userProfile, successMessage, isAuthenticated, formEmail });

    if (isAuthenticated && userProfile?.isVerified && !loading && !error) {
      navigate("/home");
      navigate(0);
      toast.success(successMessage || "Login successful!", { style: { background: "#1D1D1D", color: "#3CE7B2" } });
    } else if (error && !loading) {
      if (error?.type === "ERR_LOGIN_NOT_VERIFIED") {
        Cookies.set("emailtobeverified", formEmail);
        navigate("/verify-info");
        console.log(error);
        handleInfo(error);
        // toast.info("Please verify your email address", { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      } else {
        toast.error(error.message || "An error occurred", { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      }
      dispatch(clearAuthState());
    }
  }, [error, loading, userProfile, isAuthenticated, successMessage, formEmail, dispatch, navigate]);

  // Check for existing session on mount
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      navigate("/home");
      toast.success("Logged in!", { style: { background: "#1D1D1D", color: "#3CE7B2" } });
    }
  }, [loading]);

  useEffect(() => {
    if (formEmail && formEmail.includes("@") && formEmail.includes(".")) {
      axios
        .get(`http://localhost:7000/api/v1/auth/2fa/status?email=${formEmail}`)
        .then((res: any) => {
          setTwoFactorEnabled(res.data.payload.isEnabled);
        })
        .catch((err: any) => {
          setTwoFactorEnabled(false);
          console.log(err);
        });
    } else {
      setTwoFactorEnabled(false);
    }
  }, [formEmail]);


  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <div className="bg-[#3CE7B2] h-2" style={{ width: "100%" }} />
      <SimpleHeader page="/signup" name="Sign Up" />
      <div className="flex justify-center items-center flex-1">
        { loading && <LoaderOverlay onCancel={() => dispatch(setAuthLoading(false))} />}
        <div
          className={`w-full max-w-md bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl shadow-lg p-6 hover:border-gray-700 transition-all duration-300 ${className}`}
          {...props}
        >
          <div className="space-y-1">
            <h2 className="text-2xl text-center font-bold text-white font-coinbase-display">
              Login to your account
            </h2>
            <p className="text-gray-400 text-center text-sm font-coinbase-sans">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-white font-coinbase-sans">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="w-full bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-2 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[#3CE7B2] text-sm font-coinbase-sans">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm text-white font-coinbase-sans">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm text-gray-400 font-coinbase-sans hover:text-[#3CE7B2] transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="w-full bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-2 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-[#3CE7B2] text-start mt-2 text-sm font-coinbase-sans">{errors.password.message}</p>
                )}
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 text-center text-sm mb-4 font-coinbase-sans text-gray-400">
                  <p>Two-factor authentication is enabled for your account.</p>
                  <p>Please enter the code from your authenticator app.</p>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter the code"
                    {...register("code")}
                    className="w-full bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-2 mt-4 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200"
                  />
                  {errors.code && (
                    <p className="text-[#3CE7B2] text-sm font-coinbase-sans mt-4">{errors.code.message}</p>
                  )}
                </div>
              )}
              {error && !loading && (
                <p className="text-[#3CE7B2] text-sm font-coinbase-sans">Login failed</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#3CE7B2] text-[#121212] hover:bg-[#27A98B] py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-400 font-coinbase-sans">OR</div>
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                className="w-full h-12 bg-[#2C2C2C] text-md text-white hover:bg-[#3CE7B2] hover:text-[#121212] py-3 rounded-[100px] flex items-center justify-center font-coinbase-sans transition-all duration-200"
              >
                Sign up with Google
              </Button>
              <Button
                type="button"
                className="w-full h-12 bg-[#2C2C2C] text-md text-white hover:bg-[#3CE7B2] hover:text-[#121212] py-3 rounded-[100px] flex items-center justify-center font-coinbase-sans transition-all duration-200"
              >
                Sign up with Github
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-400 font-coinbase-sans">
              Don't have an account?{" "}
              {loading ? (
                <span>Loading...</span>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-medium underline underline-offset-4 hover:text-[#3CE7B2] transition-colors duration-200"
                >
                  Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;