import React, { useEffect, useState } from "react";
import image from "../assets/email.png";
import { resendEmail } from "@/redux/authSlice";
import { useDispatch } from "react-redux";

const VerifyInfo = () => {
  const dispatch = useDispatch();
  const [times, setTimes] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimes(times - 1);
    }, 1000);


    if (times <= 0) {
      setTimes(0);
      return () => clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [times]);

  const handleResendEmail = () => {
   dispatch(resendEmail({email: "test@test.com"}) as any)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <img
        src={image}
        alt="verify info"
        className="w-[200px] h-[200px] hover:rotate-12 transition-transform duration-300 ease-in-out hover:scale-150"
        onClick={() => {
          window.location.href = "https://mail.google.com";
        }}
      />
      <h1 className="text-4xl font-bold text-white mix-blend-difference">Verify your email</h1>
      <p className="text-sm text-gray-400 mt-2">
        Check your email for a verification link.
      </p>
      {times > 0 && (
        <p className="text-sm text-gray-400 mt-2">
          Wait {times} seconds to resend email
        </p>
      )}
      {times <= 0 && (
        <button className="text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md mt-5" onClick={handleResendEmail}>Resend Email</button>
      )}
    </div>
  );
};

export default VerifyInfo;
