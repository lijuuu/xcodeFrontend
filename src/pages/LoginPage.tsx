import React, { useEffect } from "react";
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
});

type LoginFormData = z.infer<typeof loginSchema>;

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 mr-10 text-blue-800" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Logging in...
    </div>
    <button
      onClick={onCancel}
      className="text-white text-sm font-coinbase-sans mt-4 underline hover:text-blue-800 transition-colors duration-200"
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
      navigate("/");
      navigate(0)
      toast.success(successMessage || "Login successful!");
    } else if (error && !loading) {
      if (error.code === 401) {
        Cookies.set("emailtobeverified", formEmail); 
        // dispatch(resendEmail({ email: formEmail }) as any);
        navigate("/verify-info");
        toast.info("Please verify your email address");
      } else {
        toast.error(error.message || "An error occurred");
      }
      dispatch(clearAuthState());
    }
  }, [error, loading, userProfile, isAuthenticated, successMessage, formEmail, dispatch, navigate]);

  // Check for existing session on mount
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      navigate("/");
      toast.success("Already logged in!");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white">
      <div className="bg-blue-800 h-2" style={{ width: "100%" }} />
      <SimpleHeader page="/signup" name="Sign Up" />
      <div className="flex justify-center items-center flex-1">
        {loading && <LoaderOverlay onCancel={() => dispatch(setAuthLoading(false))} />}
        <div
          className={`w-full max-w-md bg-night-black border border-gray-600 rounded-lg shadow-lg p-6 ${className}`}
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
                  className="w-full bg-night-black border border-gray-600 text-white font-coinbase-sans rounded-md p-2"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm font-coinbase-sans">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm text-white font-coinbase-sans">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm text-gray-400 font-coinbase-sans hover:underline hover:text-blue-800 transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="w-full bg-night-black border border-gray-600 text-white font-coinbase-sans rounded-md p-2"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm font-coinbase-sans">{errors.password.message}</p>
                )}
              </div>
              {error && !loading && (
                <p className="text-red-500 text-sm font-coinbase-sans">Login failed</p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-800 text-white hover:bg-blue-700 py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-400 font-coinbase-sans">OR</div>
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                className="w-full h-12 bg-gray-600 text-md text-white hover:bg-gray-500 py-3 rounded-[100px] flex items-center justify-center font-coinbase-sans"
              >
                Sign up with Google
              </Button>
              <Button
                type="button"
                className="w-full h-12 bg-gray-600 text-md text-white hover:bg-gray-500 py-3 rounded-[100px] flex items-center justify-center font-coinbase-sans"
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
                  className="font-medium underline underline-offset-4 hover:text-blue-800 transition-colors duration-200"
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