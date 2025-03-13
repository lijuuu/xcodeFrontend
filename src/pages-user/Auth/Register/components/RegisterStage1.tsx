import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
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

  const { error } = useSelector((state: any) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Stage1FormData>({
    resolver: zodResolver(stage1Schema),
  });

  useEffect(() => {
    Cookies.remove("emailtobeverified");
  }, [error]);

  const onSubmit = (data: Stage1FormData) => {
    Cookies.set("emailtobeverified", data.email, { expires: 7, secure: true, sameSite: "Strict" });
    console.log("Email to be verified:", data.email);
    setFormData(data);
    onNext();
  };

  return (
    <div className="flex flex-col bg-[#121212] text-white">
      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl p-6 shadow-lg mt-24 hover:border-gray-700 transition-all duration-300",
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
                  "w-full bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-2 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200",
                  errors.email ? "border-[#3CE7B2]" : ""
                )}
              />
              {errors.email && (
                <p className="text-xs text-[#3CE7B2] font-coinbase-sans">{errors.email.message}</p>
              )}
            </div>
            {error && (
              <p className="text-xs text-[#3CE7B2] font-coinbase-sans">{error.details}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#3CE7B2] text-[#121212] hover:bg-[#27A98B] py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
            >
              Continue
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
          <p className="mt-4 text-center text-xs text-gray-400 font-coinbase-sans">
            By creating an account you certify that you agree to the{" "}
            <a href="#" className="underline hover:text-[#3CE7B2] transition-colors duration-200">
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