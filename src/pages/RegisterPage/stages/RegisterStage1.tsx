import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthState } from "@/redux/authSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
// --- Form Schema ---
const stage1Schema = z.object({
  email: z.string().email("Use a valid email address"),
});

// --- Type Definition ---
type Stage1FormData = z.infer<typeof stage1Schema>;

function SignupForm({
  onNext,
  setFormData,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  onNext: () => void;
  setFormData: (data: Stage1FormData) => void;
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: any) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<Stage1FormData>({
    resolver: zodResolver(stage1Schema),
  });

  const onSubmit = (data: Stage1FormData) => {
    Cookies.set("emailtobeverified", data.email, { expires: 7, secure: true, sameSite: "Strict" });
    setFormData(data);
    onNext();
  };

  return (
    <div className="flex flex-col bg-night-black text-white">
      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md bg-night-black border border-gray-600 rounded-lg p-6 shadow-lg mt-24",
            className
          )}
          {...props}
        >
          <h1 className="text-2xl font-bold text-center mb-2 text-white font-coinbase-display">
            Create your account
          </h1>
          <p className="text-center text-gray-400 mb-6 text-sm font-coinbase-sans">
            Register your account to access all that xcode has to offer
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-white font-coinbase-sans">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className={cn(
                  "w-full bg-night-black border border-gray-600 text-white font-coinbase-sans",
                  errors.email ? "border-error-red" : ""
                )}
              />
              {errors.email && (
                <p className="text-xs text-error-red font-coinbase-sans">{errors.email.message}</p>
              )}
            </div>
            {error && (
              <p className="text-xs text-error-red font-coinbase-sans">{error.details}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-800 text-white hover:bg-blue-700 py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
            >
              Continue
            </Button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400 font-coinbase-sans">
            OR
          </div>
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
          <p className="mt-4 text-center text-xs text-gray-400 font-coinbase-sans">
            By creating an account you certify that you agree to the{" "}
            <a href="#" className="underline hover:text-blue-800">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;