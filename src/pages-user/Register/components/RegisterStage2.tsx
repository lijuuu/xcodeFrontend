import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Form Schema ---
const stage2Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// --- Type Definition ---
type Stage2FormData = z.infer<typeof stage2Schema>;

function RegisterStage2({
  email,
  onNext,
  onBack,
  setFormData,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  email: string;
  onNext: () => void;
  onBack: () => void;
  setFormData: (data: Stage2FormData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Stage2FormData>({
    resolver: zodResolver(stage2Schema),
  });

  const onSubmit = (data: Stage2FormData) => {
    setFormData(data);
    onNext();
  };

  const navigate = useNavigate();

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
            Welcome, {email}
          </h1>
          <p className="text-center text-gray-400 mb-6 text-sm font-coinbase-sans">
            Please enter your name
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm text-white font-coinbase-sans">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                {...register("firstName")}
                className={cn(
                  "w-full bg-night-black border border-gray-600 text-white font-coinbase-sans",
                  errors.firstName ? "border-error-red" : ""
                )}
              />
              {errors.firstName && (
                <p className="text-xs text-error-red font-coinbase-sans">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm text-white font-coinbase-sans">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                {...register("lastName")}
                className={cn(
                  "w-full bg-night-black border border-gray-600 text-white font-coinbase-sans",
                  errors.lastName ? "border-error-red" : ""
                )}
              />
              {errors.lastName && (
                <p className="text-xs text-error-red font-coinbase-sans">{errors.lastName.message}</p>
              )}
            </div>
            <div className="flex justify-between space-x-2">
              <Button
                type="button"
                onClick={onBack}
                className="w-1/2 bg-gray-600 text-white hover:bg-gray-500 py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-1/2 bg-blue-800 text-white hover:bg-blue-700 py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
              >
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterStage2;