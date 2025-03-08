import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import emailIcon from "@/assets/email.png";
import { toast } from "sonner";
import ROUTES from "@/constants/routeconst";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); 
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Try getting email from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const { email } = JSON.parse(userData);
          if (email) setEmail(email);
        } catch (err) {
          console.error("Failed to parse user data:", err);
        }
      }
    }

    if (!email) return; // Early return if no email yet

    // Simulated async verification process
    const verifyEmail = async () => {
      setLoading(true);
      try {
        // Simulate API call with a 3-second delay
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            const isSuccess = Math.random() > 0.5;
            if (isSuccess) resolve("success");
            else reject(new Error("Verification failed"));
          }, 3000);
        });
        setVerified(true);
        toast.success("Email verified successfully!", { duration: 2000 });
        setTimeout(() => navigate("/profile"), 2000);
      } catch (err) {
        setError(true);
        toast.error("Verification failed. Please try again.", { duration: 3000 });
      } finally {
        setLoading(false); // Only set false after request completes
      }
    };

    verifyEmail();
  }, [email, navigate]); // Removed retryCount since we’re redirecting to login

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-black">
        <h1 className="text-4xl font-bold text-white">No Email Provided</h1>
        <p className="text-sm text-gray-400 mt-2">
          Please sign up or log in first.
        </p>
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
            : verified
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
          ? `Please wait while we verify your email (${email})...`
          : error
          ? "Something went wrong. Return to login to try again."
          : `Your email (${email}) is verified! Redirecting to your profile...`}
      </p>

      {/* Progress bar during loading */}
      {/* {loading && (
        <motion.div
          className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
        >
          <div className="h-full bg-blue-500" />
        </motion.div>
      )} */}

      {/* Redirect to login on error */}
      {error && (
        <button
          onClick={() => navigate("/login")}
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