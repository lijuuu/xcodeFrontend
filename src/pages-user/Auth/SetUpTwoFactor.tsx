import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosInstance from '@/utils/axiosInstance'
import { AxiosError } from 'axios'
import { toast } from "sonner"
import Loader1 from "@/components/ui/loader1"

// Success Response Structure
interface SuccessResponse {
  success: boolean
  status: number
  payload: {
    isEnabled: boolean
    message: string
  }
}

// Error Response Structure
interface ErrorResponse {
  success: boolean
  status: number
  error: {
    type: string
    code: number
    message: string
    details: string
  }
}

// user Interface
interface user {
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

// LoaderOverlay Component
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 text-[#3CE7B2] mr-14" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Processing...
    </div>
    <button
      onClick={onCancel}
      className="text-gray-400 text-sm font-coinbase-sans mt-4 underline hover:text-[#3CE7B2] transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
)

// Fake delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


const SetUpTwoFactor: React.FC<any> = ({ user }) => {
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [statusResponse, setStatusResponse] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  if (!user){
    return (<>
    <p>Failed to load users</p>
    </>)
  }
  // const {user} = user;

  const fetch2FAStatus = async () => {
    if (!user?.email) {
      console.log("user ",user?.email)
      setError('User email not available')
      toast.error('User email not available', { style: { background: "#1D1D1D", color: "#FFFFFF" } })
      return
    }

    setLoading(true)
    setError('')

    try {
      await delay(1000)
      const response = await axiosInstance.get<SuccessResponse>(`/auth/2fa/status?email=${user.email}`)
      if (response.data.success && response.status === 200) {
        const { isEnabled, message } = response.data.payload
        setStatusResponse(`2FA Enabled: ${isEnabled}${message ? `\nMessage: ${message}` : ''}`)
        toast.success('Status fetched successfully', { style: { background: "#1D1D1D", color: "#3CE7B2" } })
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      const errorMessage = error.response?.data?.error?.details || error.response?.data?.error?.message || 'Failed to fetch status'
      setError(errorMessage)
      toast.error(errorMessage, { style: { background: "#1D1D1D", color: "#FFFFFF" } })
    } finally {
      setLoading(false)
    }
  }

  // Prefetch 2FA status on component mount
  useEffect(() => {
    fetch2FAStatus()
  }, [user.email])

  const handleGenerate = async () => {
    if (!password) {
      setError('Please enter a password')
      toast.error('Password is required', { style: { background: "#1D1D1D", color: "#FFFFFF" } })
      return
    }

    setLoading(true)
    setError('')

    try {
      await delay(1000)
      const response = await axiosInstance.post('/users/security/2fa/setup', { password })
      if (response.status === 200) {
        setQrCode(response.data.payload.image)
        setSecret(response.data.payload.secret)
        toast.success('QR Code generated successfully', { style: { background: "#1D1D1D", color: "#3CE7B2" } })
        // Refresh status after generating QR code
        fetch2FAStatus()
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>
      const errorMessage = error.response?.data?.error?.details || error.response?.data?.error?.message || 'Failed to generate QR code'
      setError(errorMessage)
      if (error.response?.data?.error?.type === 'ERR_2FA_ALREADY_ENABLED') {
        toast.error('2FA is already enabled for this account', { style: { background: "#1D1D1D", color: "#FFFFFF" } })
      } else {
        toast.error(errorMessage, { style: { background: "#1D1D1D", color: "#FFFFFF" } })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-[#1D1D1D] border border-[#2C2C2C] rounded-xl shadow-lg p-6 hover:border-gray-700 transition-all duration-300 relative">
      { loading && <LoaderOverlay onCancel={() => setLoading(false)} />}
      <h2 className="text-2xl font-bold text-white font-coinbase-display mb-6">Set Up Two-Factor Authentication</h2>
      <div className="space-y-6">
        {error && (
          <p className="text-[#3CE7B2] text-sm font-coinbase-sans text-center">{error}</p>
        )}

        {/* QR Code Display */}
        {qrCode && (
          <div className="space-y-4 text-center">
            <p className="text-gray-400 text-sm font-coinbase-sans">Scan this QR code with your authenticator app</p>
            <img
              src={`data:image/jpeg;base64,${qrCode}`}
              alt="QR Code"
              className="mx-auto w-48 h-48 rounded-md border border-[#2C2C2C]"
            />
            {secret && (
              <p className="text-gray-400 text-sm font-coinbase-sans">
                Secret: <span className="font-mono text-white">{secret}</span>
              </p>
            )}
          </div>
        )}

        {/* Generate QR Code */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-white font-coinbase-sans">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[30%] bg-[#2C2C2C] border border-[#2C2C2C] text-white font-coinbase-sans rounded-md p-2 hover:border-[#3CE7B2] focus:border-[#3CE7B2] focus:ring-[#3CE7B2] transition-all duration-200"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleGenerate}
            className="w-[30%] bg-[#3CE7B2] text-[#121212] hover:bg-[#27A98B] py-3 rounded-md transition-colors duration-200 font-coinbase-sans"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </div>

        {/* 2FA Status with Refresh */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-white font-coinbase-sans">2FA Status</h3>
            <Button
              onClick={fetch2FAStatus}
              className="bg-[#2C2C2C] text-[#3CE7B2] hover:bg-[#3CE7B2] hover:text-[#121212] py-1 px-3 rounded-md transition-colors duration-200 font-coinbase-sans"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {statusResponse && (
            <div className="mt-4 p-3 bg-[#2C2C2C] rounded-md text-sm text-gray-400 font-mono overflow-auto">
              {statusResponse}
            </div>
          )}
          <Button variant={"destructive"}>Delete</Button>
        </div>
      </div>
    </div>
  )
}

export default SetUpTwoFactor