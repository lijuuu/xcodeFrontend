import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import emailIcon from "@/assets/email.png";
import { toast } from "sonner";
import ROUTES from "@/constants/routeconst";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "@/redux/authSlice";
import Cookies from "js-cookie";
const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, successMessage, error, isAuthenticated } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // Extract email and token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");
    const token = queryParams.get("token");
    if (!email || !token) {
      toast.error("Invalid verification link. Please try again.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Dispatch verifyEmail thunk with email and token
    dispatch(verifyEmail({ email, token }) as any);
  }, [dispatch, location.search, navigate]);

  useEffect(() => {
    if (successMessage && !loading) {
      toast.success(successMessage, { duration: 2000 });
      setTimeout(() => navigate("/"), 2000);
    }
    if (error && !loading) {
      toast.error(error.message || "Verification failed. Please try again.", { duration: 3000 });
    }
  }, [successMessage, error, loading, navigate, isAuthenticated]);

  if (!location.search.includes("email=") || !location.search.includes("token=")) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-black">
        <h1 className="text-4xl font-bold text-white">No Verification Data Provided</h1>
        <p className="text-sm text-gray-400 mt-2">Please use a valid verification link.</p>
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-black">
      {/* Email Icon Animation */}
      <motion.img
        src={emailIcon}
        alt="Email verification"
        className="w-[200px] h-[200px]"
        animate={
          loading
            ? { y: [-10, 10], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }
            : successMessage
            ? { scale: [1, 1.2, 1], opacity: [1, 1, 0.8], transition: { duration: 1, ease: "easeOut" } }
            : { rotate: [0, -10, 10, 0], transition: { duration: 0.5, ease: "easeInOut" } }
        }
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        aria-label="Email verification status"
      />

      <h1 className="text-4xl font-bold text-white">
        {loading ? "Verifying email..." : error ? "Verification failed" : "Email verified!"}
      </h1>

      <p className="text-sm text-gray-400 mt-2 max-w-md text-center">
        {loading
          ? `Please wait while we verify your email...`
          : error
          ? "Something went wrong. Return to login to try again."
          : `Your email is verified! Redirecting to your Login page...`}
      </p>

      {error && !loading && (
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="px-4 py-2 mt-4 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Return to login"
        >
          Back to Login
        </button>
      )}
    </div>
  );
};

export default VerifyEmail;