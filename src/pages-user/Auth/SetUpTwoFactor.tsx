import React from 'react'
import { useState } from 'react'
// import { QRCode } from 'react-qrcode-logo'
import axiosInstance from '@/utils/axiosInstance'
import axios from 'axios'

const SetUpTwoFactor = () => {
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [statusResponse, setStatusResponse] = useState<string>('')

  const handleGenerate = async () => {
    const response = await axiosInstance.post('/users/security/2fa/setup', {
      password: password
    })
    console.log(response)

    if (response.status === 200) {
      setQrCode(response.data.payload.image)
      setSecret(response.data.payload.secret)
    } else {
      alert('Invalid password')
    }
  }

  const handleCheckStatus = async () => {
    if (!email) {
      alert('Please enter an email')
      return
    }
    const response = await axios.get(`http://localhost:7000/api/v1/auth/2fa/status?email=${email}`)
    setStatusResponse(JSON.stringify(response.data))
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1>Set Up Two Factor</h1>
      {qrCode && <p>Scan the QR code with your authenticator app</p>}
      {qrCode && <img src={`data:image/jpeg;base64,${qrCode}`} alt="QR Code" />}
      {secret && <p>Secret: {secret}</p>}


      <div className='flex flex-col items-center justify-center'>
        <input type="text" placeholder='Enter the password' onChange={(e) => setPassword(e.target.value)} className='border-2 border-gray-300 rounded-md p-2 text-black' />
        <button onClick={handleGenerate} className='bg-blue-500 text-white rounded-md p-2'>Generate</button>

      </div>

      <div>
        <p>Check Status</p>
        <input type="text" placeholder='Enter the email' onChange={(e) => setEmail(e.target.value)} className='border-2 border-gray-300 rounded-md p-2 text-black' />
        <button onClick={handleCheckStatus} className='bg-blue-500 text-white rounded-md p-2'>Check Status</button>
        <p>{statusResponse}</p>
      </div>

    </div>
  )
}

export default SetUpTwoFactor
