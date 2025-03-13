import axiosInstance from "@/utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader1 from "@/components/ui/loader1"; // Assuming this is the correct path
import { toast } from "sonner"; // Assuming you want to use toast for feedback

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50">
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader1 className="w-12 h-12 text-blue-800" />
      <div className="text-white text-xl opacity-80 font-coinbase-sans">
        Processing...
      </div>
      <button
        onClick={onCancel}
        className="text-white text-sm font-coinbase-sans underline hover:text-blue-800 transition-colors duration-200"
      >
        Cancel
      </button>
    </div>
  </div>
);

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email"); // Extract email from query params

  // Redirect or show error if token or email is missing
  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing reset token or email.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `http://localhost:7000/api/v1/auth/password/reset`, // Updated backend URL
        {
          email: email, // Use email as userID from query params
          token,
          newPassword: password,
          confirmPassword,
        }
      );
      console.log("Reset password response:", response.data);
      setSuccess("Password reset successful. Redirecting to login...");
      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 2000); // Navigate to login after 2 seconds
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-night-black flex flex-col items-center justify-center relative">
      {loading && (
        <LoaderOverlay
          onCancel={() => {
            setLoading(false); // Cancel loading state
          }}
        />
      )}
      <h1 className="text-4xl font-bold text-white mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 mb-4"
          disabled={loading || !token || !email}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 mb-4"
          disabled={loading || !token || !email}
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-500"
          disabled={loading || !token || !email}
        >
          Submit
        </button>
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-center mt-4">{success}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;