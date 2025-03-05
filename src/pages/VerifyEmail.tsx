import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import ROUTES from "@/routeconst";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");

  // Get email from state or localStorage on mount
  useEffect(() => {
    // First try to get from navigation state
    if (location.state?.email) {
      setEmail(location.state.email);
      return;
    }

    // Fallback to localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const { email } = JSON.parse(userData);
        if (email) {
          setEmail(email);
          return;
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }

    // If no email found, redirect to login
    if (!email) {
      navigate('/login');
    }
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("No email address found");
      return;
    }

    try {
      setLoading(true);
      const response:any = await axios.get(
        ROUTES.BASEURLDEVELOPMENT + ROUTES.OTP_RESEND + `?email=${email}`
      );

      if (response.data.success) {
        toast.success("Verification email sent successfully!");
      } else {
        toast.error(response.data.error?.message || "Failed to send verification email");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || "Failed to send email";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Don't render anything while loading email
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Verify Your Email</h1>
      <p className="text-sm text-gray-500">
        A verification link has been sent to:
      </p>
      <p className="text-md font-medium">{email}</p>
      <p className="text-sm text-gray-500">
        Please check your email and click on the link to verify your account.
      </p>

      <Button
        onClick={handleResendEmail}
        className="text-sm text-white bg-blue-500 hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Sending..." : "Resend Verification Email"}
      </Button>

      <div className="mt-4">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-500 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;