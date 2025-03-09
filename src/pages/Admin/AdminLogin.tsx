import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { loginAdmin, clearError } from "@/redux/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Loader1 from "@/components/ui/loader1";
import SimpleHeader from "@/components/sub/AuthHeader";

// Form Schema
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

// Loader Overlay Component
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

// AdminLoginForm Component
function AdminLoginForm({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { loading, error, isAuthenticated, message } = useSelector((state: any) => state.admin);

  const onSubmit = (data: LoginFormData) => {
    console.log("Form Data:", data);
    dispatch(loginAdmin(data) as any);
  };

  // Handle login success and errors
  useEffect(() => {
    if (isAuthenticated && !loading && !error) {
      navigate("/admin/dashboard");
      toast.success(message || "Login successful!");
    } else if (error && !loading) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, loading, error, message, navigate, dispatch]);

  // Check for existing session on mount
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      navigate("/admin/dashboard");
      toast.success("Already logged in!");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white font-coinbase-sans">
      <div className="bg-blue-800 h-2 w-full" />
      <SimpleHeader page="/signup" name="Sign Up" />
      <div className="flex justify-center items-center flex-1">
        {loading && <LoaderOverlay onCancel={() => dispatch(clearError())} />}
        <div
          className={`w-full max-w-md bg-night-black border border-gray-600 rounded-lg shadow-lg p-6 ${className}`}
          {...props}
        >
          <div className="space-y-1">
            <h2 className="text-2xl text-center font-bold text-white font-coinbase-display">
              Admin Login
            </h2>
            <p className="text-gray-400 text-center text-sm">
              Enter your email below to login to your Admin account
            </p>
          </div>
          <div className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="w-full bg-night-black border border-gray-600 text-white rounded-md p-2"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm text-white">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="ml-auto text-sm text-gray-400 hover:underline hover:text-blue-800 transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="w-full bg-night-black border border-gray-600 text-white rounded-md p-2"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              {error && !loading && (
                <p className="text-red-500 text-sm">Login failed: {error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-800 text-white hover:bg-blue-700 py-3 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginForm;