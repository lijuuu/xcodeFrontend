import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { loginUser, clearAuthInitialState } from "@/redux/xCodeAuth";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { user, error, loading } = useSelector((state: any) => state.xCodeAuth);

  const onSubmit = (data: LoginFormData) => {
    console.log("Form Data:", data);
    dispatch(loginUser(data) as any);
  };

  useEffect(() => {
    if (user && !error && !loading) {
      navigate("/home");
      toast.success("Login successful!");
      dispatch(clearAuthInitialState());
    } else if (error && !loading) {
      if (error.code === 401) {
        navigate("/verify-email");
        toast.info("Please verify your email address");
        dispatch(clearAuthInitialState());
      } else {
        toast.error(error.details || "An error occurred");
      }
    }
  }, [user, error, loading, navigate, dispatch]);

  useEffect(() => {
    if (user?.isVerified && !error && !loading) {
      navigate("/home");
      toast.success("Already Logged In!");
    }
  }, []); 

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            {error && !loading && (
              <p className="text-red-500 text-sm">Login failed</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;