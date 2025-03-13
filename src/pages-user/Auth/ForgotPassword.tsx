import axiosInstance from "@/utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Loader1 from "@/components/ui/loader1";
import { toast } from "sonner";
import emailIcon from "@/assets/email.png";

// --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#121212] bg-opacity-95 z-50">
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader1 className="w-12 h-12 text-[#3CE7B2] mr-10 mb-8" />
      <div className="text-white text-xl opacity-80 mt-8 font-coinbase-sans">
        Sending reset link...
      </div>
      <button
        onClick={onCancel}
        className="text-gray-400 text-sm font-coinbase-sans underline hover:text-[#3CE7B2] transition-colors duration-200"
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
      toast.success("Password reset link sent successfully", {
        style: { background: "#1D1D1D", color: "#3CE7B2" },
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#1D1D1D", color: "#FFFFFF" },
      });
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] flex flex-col items-center justify-center relative">
      {loading && (
        <LoaderOverlay
          onCancel={() => {
            setLoading(false);
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
          <h1 className="text-4xl font-bold text-white font-coinbase-display mix-blend-difference">
            Check your email
          </h1>
          <p className="text-md text-center text-gray-400 font-coinbase-sans">{email}</p>
          <p className="text-sm text-gray-400 mt-2 font-coinbase-sans">{success}</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl p-6 shadow-lg hover:border-gray-700 transition-all duration-300">
          <h1 className="text-4xl font-bold text-white font-coinbase-display mix-blend-difference mb-6 text-center">
            Forgot Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm text-white font-coinbase-sans block"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-[#2C2C2C] text-white border border-[#2C2C2C] hover:border-[#3CE7B2] focus:outline-none focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200 disabled:bg-[#2C2C2C] disabled:opacity-50"
                disabled={loading}
                required
              />
              {error && (
                <p className="text-[#3CE7B2] text-sm font-coinbase-sans text-center mt-2">
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#3CE7B2] text-[#121212] rounded-md hover:bg-[#27A98B] transition-colors duration-200 font-coinbase-sans disabled:bg-[#2C2C2C] disabled:text-gray-400"
              disabled={loading}
            >
              Reset Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;