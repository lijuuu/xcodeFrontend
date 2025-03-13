import axiosInstance from "@/utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Loader1 from "@/components/ui/loader1"; // Assuming this is the correct path
import { toast } from "sonner";
import emailIcon from "@/assets/email.png";

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50 ">
    <div className="flex flex-col items-center justify-center space-y-4 ">
      <Loader1 className="w-12 h-12 text-blue-800 mr-10 mb-8" />
      <div className="text-white text-xl opacity-80 mt-8 font-coinbase-sans">
        Sending reset link...
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Redirect to home if accessToken exists
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `http://localhost:7000/api/v1/auth/password/forgot`,
        { email }
      );
      console.log("Forgot password response:", response.data);
      setSuccess("Password reset link sent to your email. Please check your inbox.");
      toast.success("Password reset link sent successfully");
      // Optionally navigate after a delay
      // setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Forgot password error:", err);
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
      {success ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src={emailIcon}
            alt="email"
            className="w-[200px] h-[200px] hover:rotate-12 transition-transform duration-300 ease-in-out hover:scale-150"
            onClick={() => {
              window.location.href = "https://mail.google.com";
            }}
          />
          <h1 className="text-4xl font-bold text-white mix-blend-difference">Check your email</h1>
          <p className="text-md text-center text-gray-400">{email}</p>
          <p className="text-sm text-gray-400 mt-2">{success}</p>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-white mix-blend-difference mb-6">Forgot Password</h1>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 mb-4"
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-500"
              disabled={loading}
            >
              Reset Password
            </button>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;