import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, clearAuthInitialState } from "@/redux/xCodeAuth";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader1 from "@/components/ui/loader1";
import SimpleHeader from "@/components/sub/simpleheader";

// --- Constants ---
const STAGE_COUNT = 4; 

// --- Form Schemas ---
const stage1Schema = z.object({
  email: z.string().email("Use a valid email address"),
});

const stage2Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const stage3Schema = z.object({
  country: z.string().min(1, "Country is required"),
  profession: z.string().min(1, "Profession is required"),
});

const stage4Schema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password must be less than 20 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must have uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

// --- Type Definitions ---
type Stage1FormData = z.infer<typeof stage1Schema>;
type Stage2FormData = z.infer<typeof stage2Schema>;
type Stage3FormData = z.infer<typeof stage3Schema>;
type Stage4FormData = z.infer<typeof stage4Schema>;

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

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 mt-44 mr-10 text-blue-800" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Creating your account
    </div>
    <button
      onClick={onCancel}
      className="text-white text-sm font-coinbase-sans mt-4 underline hover:text-blue-800 transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
);

// --- Stage 1 Component (Email Collection) ---
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
  const { error } = useSelector((state: any) => state.xCodeAuth);
  const { register, handleSubmit, formState: { errors } } = useForm<Stage1FormData>({
    resolver: zodResolver(stage1Schema),
  });

  const onSubmit = (data: Stage1FormData) => {
    setFormData(data);
    onNext();
  };

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white">
      <SimpleHeader currentPage="/login" />

      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md  bg-night-black border border-gray-600 rounded-lg p-6 shadow-lg",
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

// --- Stage 2 Component (Names Collection) ---
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
    <div className="flex flex-col min-h-screen bg-night-black text-white">
      <header className="flex justify-between items-center px-6 py-4 bg-night-black">
        <div className="text-2xl font-bold text-white font-coinbase-display hover:cursor-crosshair">
          xcode
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-white font-coinbase-sans hover:text-blue-600"
        >
          Sign In
        </button>
      </header>

      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md bg-night-black border border-gray-600 rounded-lg p-6 shadow-lg",
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

// --- Stage 3 Component (User Info Collection) ---
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
    <div className="flex flex-col min-h-screen bg-night-black text-white ">
      <header className="flex justify-between items-center px-6 py-4 bg-night-black">
        <div className="text-2xl font-bold text-white font-coinbase-display hover:cursor-crosshair">
          xcode
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-white font-coinbase-sans hover:none"
        >
          Sign In
        </button>
      </header>

      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md bg-night-black border border-gray-600 rounded-lg p-6 shadow-lg",
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

// --- Stage 4 Component (Passwords Collection) ---
function RegisterStage4({
  email,
  onBack,
  onSubmit,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  email: string;
  onBack: () => void;
  onSubmit: (data: Stage4FormData) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Stage4FormData>({
    resolver: zodResolver(stage4Schema),
  });

  const onFormSubmit = (data: Stage4FormData) => {
    onSubmit(data);
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white">
      <header className="flex justify-between items-center px-6 py-4 bg-night-black">
        <div className="text-2xl font-bold text-white font-coinbase-display hover:cursor-crosshair">
          xcode
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-white font-coinbase-sans hover:none"
        >
          Sign In
        </button>
      </header>

      <div className="flex justify-center items-center flex-1 p-4">
        <div
          className={cn(
            "w-full max-w-md bg-night-black border border-gray-600 rounded-lg p-6 shadow-lg",
            className
          )}
          {...props}
        >
          <h1 className="text-2xl font-bold text-center mb-2 text-white font-coinbase-display">
            Welcome, {email}
          </h1>
          <p className="text-center text-gray-400 mb-6 text-sm font-coinbase-sans">
            Please set your password
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-white font-coinbase-sans">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={cn(
                  "w-full bg-night-black border border-gray-600 text-white font-coinbase-sans",
                  errors.password ? "border-error-red" : ""
                )}
              />
              {errors.password && (
                <p className="text-xs text-error-red font-coinbase-sans">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-white font-coinbase-sans">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={cn(
                  "w-full bg-night-black border border-gray-600 text-white font-coinbase-sans",
                  errors.confirmPassword ? "border-error-red" : ""
                )}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-error-red font-coinbase-sans">
                  {errors.confirmPassword.message}
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
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Main RegisterPage Component ---
function RegisterPage() {
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Stage1FormData & Stage2FormData & Stage3FormData & Stage4FormData
  >({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
    profession: "",
    password: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, user } = useSelector((state: any) => state.xCodeAuth);

  // Redirect to verify email on successful registration
  useEffect(() => {
    if (user && error == null) {
      navigate("/verify-email");
      toast.success("Email sent to verify your account");
    }
  }, [user, error, navigate]);

  // Clear auth state on mount
  useEffect(() => {
    dispatch(clearAuthInitialState());
  }, [dispatch]);

  // Stage transition handlers
  const handleStage1Submit = () => setStage(2);

  const handleStage2Submit = (data: Stage2FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStage(3);
  };

  const handleStage3Submit = (data: Stage3FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    console.log("Stage 3 Data:", formData);
    setStage(4);
  };

  const handleStage4Submit = (data: Stage4FormData) => {
    const finalData = { ...formData, ...data };
    console.log("Final Submission Data:", finalData);
    setLoading(true);
    setTimeout(() => {
      console.log("loading......");
      setLoading(false);
    }, 10000);
    dispatch(registerUser(finalData) as any);
  };

  const goBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  // Progress calculation
  const progress = (stage / STAGE_COUNT) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white relative">
      {loading && <LoaderOverlay onCancel={() => setLoading(false)} />}
      <div className="w-full bg-gray-700 h-2">
        <div
          className="bg-blue-800 h-2 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-col flex-1">
        {stage === 1 && (
          <SignupForm
            onNext={handleStage1Submit}
            setFormData={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {stage === 2 && (
          <RegisterStage2
            email={formData.email}
            onNext={handleStage2Submit as any}
            onBack={goBack}
            setFormData={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {stage === 3 && (
          <RegisterStage3
            email={formData.email}
            onNext={handleStage3Submit as any}
            onBack={goBack}
            setFormData={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {stage === 4 && (
          <RegisterStage4
            email={formData.email}
            onBack={goBack}
            onSubmit={handleStage4Submit as any}
          />
        )}
      </div>
    </div>
  );
}

export default RegisterPage;