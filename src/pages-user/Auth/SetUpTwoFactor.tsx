import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';
import { toast } from "sonner";
import Loader1 from "@/components/ui/loader3";
import { Eye, EyeOff, Copy, Check, ChevronDown, ChevronUp, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import googleAuthImg from "@/assets/googleauth1.png"

interface SuccessResponse {
  success: boolean;
  status: number; 
  payload: {
    isEnabled: boolean;
    message: string;
    image?: string;
    secret?: string;
  };
}

interface ErrorResponse {
  success: boolean;
  status: number;
  error: {
    type: string;
    code: number;
    message: string;
    details: string;
  };
}

interface UserProfile {
  userID: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
  email: string;
  role: string;
  country: string;
  isBanned: boolean;
  isVerified: boolean;
  primaryLanguageID: string;
  muteNotifications: boolean;
  socials: Socials;
  createdAt: number;
}

interface Socials {
  [key: string]: string;
}

const SetUpTwoFactor: React.FC<{ user: { userProfile: UserProfile } }> = ({ user }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [statusResponse, setStatusResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrVisible, setQrVisible] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  // const lockControls = useAnimation();
  const { userProfile } = user;

  useEffect(() => {
    fetch2FAStatus();
  }, [userProfile.email]);

  useEffect(() => {
    if (qrCode) {
      const timer = setTimeout(() => {
        setQrVisible(false);
        toast.warning('QR code hidden for security. Regenerate if needed.', { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [qrCode]);


  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success('Secret copied to clipboard!', { style: { background: "#1D1D1D", color: "#3CE7B2" } });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!password) {
      setError('Please enter your password');
      toast.error('Password is required', { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      return;
    }

    setLoading(true);
    setError('');
    setQrVisible(true);

    try {
      const response = await axiosInstance.post<SuccessResponse>('/users/security/2fa/setup', { password });
      if (response.status === 200) {
        setQrCode(response.data.payload.image || '');
        setSecret(response.data.payload.secret || '');
        toast.success('QR Code generated successfully', { style: { background: "#1D1D1D", color: "#3CE7B2" } });
        fetch2FAStatus();
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.error?.details || error.response?.data?.error?.message || 'Failed to generate QR code';
      setError(errorMessage);
      if (error.response?.data?.error?.type === 'ERR_2FA_ALREADY_ENABLED') {
        toast.error('2FA is already enabled for this account', { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      } else {
        toast.error(errorMessage, { style: { background: "#1D1D1D", color: "#FFFFFF" } });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetch2FAStatus = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<SuccessResponse>(`/auth/2fa/status?email=${userProfile.email}`);
      if (response.data.success && response.status === 200) {
        const { isEnabled, message } = response.data.payload;
        setEnabled(isEnabled);
        setStatusResponse(`2FA Enabled: ${isEnabled}${message ? `\nMessage: ${message}` : ''}`);
        toast.success('Status fetched successfully', { style: { background: "#1D1D1D", color: "#3CE7B2" } });
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.error?.details || error.response?.data?.error?.message || 'Failed to fetch status';
      setError(errorMessage);
      toast.error(errorMessage, { style: { background: "#1D1D1D", color: "#FFFFFF" } });
    } finally {
      setLoading(false);
    }
  };


  //return 1
  if (!userProfile?.email) {
    console.log(userProfile);
    return <p className="text-red-500">Failed to load user data</p>;
  }

  //return 2
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl shadow-lg p-8 hover:border-gray-700 transition-all duration-300 relative overflow-hidden"
      style={{
        background: 'linear-gradient(45deg, #1D1D1D, #2C2C2C)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 10s ease infinite',
      }}
    >
      <style>
        {`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glow {
          box-shadow: 0 0 15px rgba(60, 231, 178, 0.5);
        }
        .lock-hover:hover {
          transform: rotate(15deg);
        }
      `}
      </style>
      {loading && <LoaderOverlay onCancel={() => setLoading(false)} />}
      <div className="flex items-center space-x-3 mb-2">
        <motion.div >
          <Lock size={28} className="text-[#3CE7B2] lock-hover transition-transform duration-200" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white font-coinbase-display">Set Up Two-Factor Authentication</h2>
      </div>
      <p className="text-gray-400 text-sm font-coinbase-sans mb-6">Secure your account with Google Authenticator for an extra layer of protection.</p>

      <div className="space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full"
        >
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between bg-[#2C2C2C] p-4 rounded-md text-white font-coinbase-sans hover:bg-[#3CE7B2] hover:text-[#121212] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Key size={20} className="text-[#3CE7B2]" />
              <span>How to Set Up Google Authenticator</span>
            </div>
            {showInstructions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                // initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                // exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.02 }}
                className="w-full mt-4 p-4 bg-[#2C2C2C] rounded-md text-gray-400 text-sm font-coinbase-sans space-y-4"
              >
                <h3 className="text-lg text-white font-coinbase-sans">Step-by-Step Guide</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Download Google Authenticator:</strong>
                    <div className="mt-2 space-y-2">
                      <p>
                        - For Android: Download from the{' '}
                        <a
                          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3CE7B2] hover:underline"
                        >
                          Google Play Store
                        </a>.
                      </p>
                      <p>
                        - For iOS: Download from the{' '}
                        <a
                          href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3CE7B2] hover:underline"
                        >
                          App Store
                        </a>.
                      </p>
                    </div>
                  </li>
                  <li>
                    <strong>Install and Open the App:</strong>
                    <p>Once installed, open Google Authenticator on your device.</p>
                  </li>
                  <li>
                    <strong>Add an Account:</strong>
                    <p>
                      - Tap <strong>Get Started</strong> or the <strong>+</strong> icon in the app.
                      <br />
                      - Choose <strong>Scan a QR code</strong>.
                      <br />
                      - Allow camera access if prompted.
                    </p>
                  </li>
                  <li>
                    <strong>Scan the QR Code:</strong>
                    <p>
                      - Generate the QR code below by entering your password and clicking "Generate QR Code".
                      <br />
                      - Use Google Authenticator to scan the QR code displayed on this page.
                    </p>
                  </li>
                  <li>
                    <strong>Verify the Code:</strong>
                    <p>
                      After scanning, Google Authenticator will display a 6-digit code that refreshes every 30 seconds. You may need this code to verify your setup with some services.
                    </p>
                  </li>
                </ol>
                <div className="mt-4 p-4 bg-[#1D1D1D] rounded-md border border-yellow-500">
                  <h4 className="text-yellow-400 font-bold">Important Warnings</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Never share your 2FA codes with anyone, as they can be used to access your account.</li>
                    <li>Save your secret key in a secure location. If you lose access to your authenticator app, you’ll need this key to recover your account.</li>
                    <li>If you lose your device, you may lose access to your 2FA codes. Consider setting up a backup device or saving recovery codes if your service provides them.</li>
                    <li>Google Authenticator does not lock the app by default. Add a passcode or biometric lock to your device to prevent unauthorized access.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-white font-coinbase-sans">Enter Your Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-3 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200"
                  disabled={loading}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3CE7B2] transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full text-[#FF5555] text-sm font-coinbase-sans text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGenerate}
                className="w-full bg-[#3CE7B2] text-[#121212] hover:bg-[#27A98B] py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {qrCode && qrVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            className="w-full space-y-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <img className='max-w-6 max-h-6 opacity-80' src={googleAuthImg}></img>
              <p className="text-gray-400 text-sm font-coinbase-sans">Scan this QR code with Google Authenticator</p>
            </div>
            <motion.img
              src={`data:image/jpeg;base64,${qrCode}`}
              alt="QR Code for 2FA setup"
              className="mx-auto w-48 h-48 rounded-md border border-[#2C2C2C] glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            {secret && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex items-center justify-center space-x-2"
              >
                <p className="text-gray-400 text-sm font-coinbase-sans">
                  Secret: <span className="font-mono text-white">{secret}</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopySecret}
                  className="text-[#3CE7B2] hover:text-[#27A98B] transition-colors duration-200 relative group"
                  aria-label="Copy secret to clipboard"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#2C2C2C] text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {copied ? 'Copied!' : 'Copy Secret'}
                  </span>
                </motion.button>
              </motion.div>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="text-yellow-400 text-sm font-coinbase-sans mt-2"
            >
              Warning: Save this secret key! You’ll need it if you lose access to your authenticator app.
            </motion.p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-white font-coinbase-sans">2FA Status</h3>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={fetch2FAStatus}
                className="bg-[#2C2C2C] text-[#3CE7B2] hover:bg-[#3CE7B2] hover:text-[#121212] py-1 px-3 rounded-md transition-colors duration-200 font-coinbase-sans"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </motion.div>
          </div>
          {statusResponse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-[#2C2C2C] rounded-md text-sm text-gray-400 font-mono overflow-auto shadow-inner"
            >
              {statusResponse}
            </motion.div>
          )}
          {enabled && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
                    toast.success('2FA disabled successfully', { style: { background: "#1D1D1D", color: "#3CE7B2" } });
                    setEnabled(false);
                    setQrCode('');
                    setSecret('');
                    fetch2FAStatus();
                  }
                }}
                className="w-full"
              >
                Disable 2FA
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SetUpTwoFactor;


const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] bg-opacity-95 z-50"
  >
    <Loader1 className="w-12 h-12 text-[#3CE7B2] mr-14" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-4">
      Processing...
    </div>
    <button
      onClick={onCancel}
      className="text-gray-400 text-sm font-coinbase-sans mt-4 underline hover:text-[#3CE7B2] transition-colors duration-200"
    >
      Cancel
    </button>
  </motion.div>
);