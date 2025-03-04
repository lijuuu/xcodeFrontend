import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearAuthInitialState, resendEmail } from "@/redux/xCodeAuth";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const VerifyEmail = () => {
  const { user, error, success } = useSelector((state: any) => state.xCodeAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState(user?.email || "");

  // Check URL params on load and verify if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get("email");
    const tokenFromUrl = searchParams.get("token");

    if (emailFromUrl && tokenFromUrl) {
      verifyEmail(emailFromUrl, tokenFromUrl);
    }
  }, []);

  // Verify email with backend
  const verifyEmail = async (email: string, token: string) => {
    try {
      const response: any = await axios.get("http://localhost:7000/api/v1/auth/verify", {
        params: { email, token },
      });

      if (response.data.success) {
        toast.success("Email verified successfully!");
        navigate("/login");
      } else {
        toast.error(response?.data?.error?.details || "Verification failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.details || "Failed to verify email");
    }
  };

  // Handle resend email
  const handleResendEmail = () => {
    const emailToSend = email || user?.email;
    if (emailToSend) {
      dispatch(resendEmail(emailToSend) as any);
    } else {
      toast.error("Please enter an email address");
    }
  };

  // Toast notifications for Redux state
  useEffect(() => {
    if (error) {
      toast.error(error?.details || "Verification failed");
    }
    if (success) {
      toast.success("Verification email sent successfully!");
    }
  }, [error, success]);

  const handleLogin = () => {
    navigate("/login");
    dispatch(clearAuthInitialState());
  };

  const handleSignup = () => {
    navigate("/signup");
    dispatch(clearAuthInitialState());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Verify Your Email</h1>
      <p className="text-sm text-gray-500">Please check your email for a verification link.</p>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-sm text-gray-500 border border-gray-300 rounded p-2 w-64"
        placeholder="Enter your email"
      />
      <Button
        onClick={handleResendEmail}
        className="text-sm text-white bg-blue-500 hover:bg-blue-600"
      >
        Resend Email
      </Button>
      <div className="flex space-x-4">
        <p onClick={handleLogin} className="text-sm text-gray-500 cursor-pointer">
          Login
        </p>
        <p onClick={handleSignup} className="text-sm text-gray-500 cursor-pointer">
          Register
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;