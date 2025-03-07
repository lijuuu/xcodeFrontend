import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, clearAuthInitialState } from "@/redux/xCodeAuth";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be less than 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must have uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, user } = useSelector((state: any) => state.xCodeAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Form Data:", data);
    dispatch(registerUser(data) as any);
  };

  useEffect(() => {
    if (user && error == null) {
      navigate("/verify-email");
      toast.success("Email sent to verify your account");
    }
  }, [user, error, navigate]);

  useEffect(() => {
    dispatch(clearAuthInitialState());
  }, []);

  return (
    <div className="flex justify-center bg-black items-center min-h-screen ">
      <Card className={cn("w-full max-w-md bg-blue-800", className)} {...props}>
        <CardHeader className="space-y-1 items-center  px-4 py-3 m-5">
          <CardTitle className="text-xl font-bold text-white">Create an Account</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3 m-5">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm text-white">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className={errors.firstName ? "border-error-text" : ""}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm text-white">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={errors.lastName ? "border-error-text" : ""}
                />
                {errors.lastName && <p className="text-error-text text-xs">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className={errors.email ? "border-error-text" : ""}
              />
              {errors.email && <p className="text-error-text text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm text-white">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-error-text" : ""}
              />
              {errors.password && <p className="text-error-text text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-error-text" : ""}
              />
              {errors.confirmPassword && <p className="text-error-text text-xs">{errors.confirmPassword.message}</p>}
            </div>
            <div>
              {error && <p className="text-error-text text-xs">{error.details}</p>}
            </div>
            <Button className="bg-primary-button-red text-white hover:text-black hover:bg-blue-600 w-full h-9" type="submit">
              Sign Up
            </Button>
          </form>

          <div className="mt-3 text-center text-xs text-gray-300">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium underline underline-offset-4 hover:text-primary text-white"
            >
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignupForm;