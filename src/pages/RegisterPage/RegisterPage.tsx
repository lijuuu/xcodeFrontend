import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { registerUser, clearAuthState as clearAuthInitialState } from "@/redux/authSlice";
import Loader1 from "@/components/ui/loader1";
import SignupForm from "./stages/RegisterStage1";
import RegisterStage2 from "./stages/RegisterStage2";
import RegisterStage3 from "./stages/RegisterStage3";
import RegisterStage4 from "./stages/RegisterStage4";
import AuthHeader from "@/components/sub/AuthHeader";

// --- Constants ---
const STAGE_COUNT = 4;

// --- Type Definitions ---
type Stage1FormData = { email: string };
type Stage2FormData = { firstName: string; lastName: string };
type Stage3FormData = { country: string; profession: string };
type Stage4FormData = { password: string; confirmPassword: string };

// --- Main RegisterPage Component ---
function RegisterPage() {
  const [stage, setStage] = useState(1);
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
  const { loading, error, successMessage, userId } = useSelector((state: any) => state.auth);

  // Redirect to verify email on successful registration
  useEffect(() => {
    if (userId && !error) {
      navigate("/verify-info");
      toast.success(successMessage || "Email sent to verify your account");
    }
  }, [userId, error, successMessage, navigate]);

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
    dispatch(registerUser(finalData) as any); // Dispatch registerUser with final data
  };

  const goBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  // Progress calculation
  const progress = (stage / STAGE_COUNT) * 100;

  // Loader state now synced with Redux loading
  const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
      <Loader1 className="w-12 h-12 mr-10 text-blue-800" />
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

  // Show error or success toast based on state
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Registration failed");
    }
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-night-black text-white relative">
      {loading && <LoaderOverlay onCancel={() => {}} />} {/* Disable cancel for now */}
      <div className="w-full bg-gray-700 h-2">
        <div
          className="bg-blue-800 h-2 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <AuthHeader page="/login" name="Sign In" />
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