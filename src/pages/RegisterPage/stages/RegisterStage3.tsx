import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useCountries from "@/hooks/useCountries";
import { useState, useEffect } from "react";
import { lang } from "@/constants/lang";

// --- Form Schema ---
const stage3Schema = z.object({
  country: z.string().min(1, "Country is required"),
  profession: z.string().min(1, "Profession is required"),
});

type Stage3FormData = z.infer<typeof stage3Schema>;

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

// Updated CountriesWithFlags Component
const CountriesWithFlags = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { countries, fetchCountries } = useCountries();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleSelect = (name: string) => {
    onChange(name); // Pass the country name to the form
    setDropdownOpen(false);
  };

  const selectedCountryData = Object.values(countries).find((c) => c.name === value);

  return (
    <div className="relative w-full font-coinbase-sans">
      <Label className="block text-sm font-medium text-white">Country</Label>
      <div
        className="flex items-center justify-between bg-gray-700 text-white p-3 rounded mt-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {value && selectedCountryData ? (
          <div className="flex items-center space-x-2">
            <img
              src={selectedCountryData.image}
              alt={`${selectedCountryData.name} flag`}
              className="w-6 h-6"
            />
            <span>{selectedCountryData.name}</span>
          </div>
        ) : (
          <span>Select a country</span>
        )}
        <span>▼</span>
      </div>
      {dropdownOpen && (
        <div className="absolute w-full bg-gray-800 text-white mt-2 max-h-60 overflow-y-auto rounded shadow-lg z-10">
          {Object.values(countries)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((country) => (
              <div
                key={country.name}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelect(country.name)}
              >
                <img src={country.image} alt={`${country.name} flag`} className="w-6 h-6" />
                <span>{country.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

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
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Stage3FormData>({
    resolver: zodResolver(stage3Schema),
    defaultValues: {
      country: "",
      profession: "",
    },
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
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CountriesWithFlags value={field.value} onChange={field.onChange} />
                )}
              />
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
                <p className="text-xs text-error-red font-coinbase-sans">{errors.profession.message}</p>
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