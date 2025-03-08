import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// --- Form Schema ---
const stage3Schema = z.object({
  country: z.string().min(1, "Country is required"),
  profession: z.string().min(1, "Profession is required"),
});

// --- Type Definition ---
type Stage3FormData = z.infer<typeof stage3Schema>;

// --- Sample Data ---
const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
];

const professions = [
  "Software Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Frontend Developer",
  "Backend Developer",
  "QA Engineer",
  "Product Manager",
  "UI/UX Designer",
];

function RegisterStage3({
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
  setFormData: (data: Stage3FormData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Stage3FormData>({
    resolver: zodResolver(stage3Schema),
  });

  const onSubmit = (data: Stage3FormData) => {
    console.log("Stage 3 Data:", data);
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
            Please provide your user information
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm text-white font-coinbase-sans">
                Country
              </Label>
              <select
                id="country"
                {...register("country")}
                className="w-full bg-night-black border border-gray-600 text-white font-coinbase-sans p-2 rounded-md"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-xs text-error-red font-coinbase-sans">{errors.country.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-sm text-white font-coinbase-sans">
                Profession
              </Label>
              <select
                id="profession"
                {...register("profession")}
                className="w-full bg-night-black border border-gray-600 text-white font-coinbase-sans p-2 rounded-md"
              >
                <option value="">Select a profession</option>
                {professions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
              {errors.profession && (
                <p className="text-xs text-error-red font-coinbase-sans">
                  {errors.profession.message}
                </p>
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

export default RegisterStage3;