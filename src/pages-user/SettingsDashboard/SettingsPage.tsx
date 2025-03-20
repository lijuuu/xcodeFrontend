// SettingsPage.tsx (unchanged)
import React, { useState,useEffect } from 'react'
import NavHeader from '@/components/sub/NavHeader'
import SetUpTwoFactor from '@/pages-user/Auth/SetUpTwoFactor'
import EditProfileCard from '@/pages-user/Profile/components/EditProfileCard'
import { useSelector } from 'react-redux'

import { useDispatch } from 'react-redux'
import { getUser } from '@/redux/authSlice'


const SettingsSidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="w-64 bg-[#1D1D1D] border-r border-[#2C2C2C] flex flex-col">
      <div className="p-6 border-b border-[#2C2C2C]">
        <h2 className="text-xl font-bold text-white font-coinbase-display">Settings</h2>
        <p className="text-gray-400 text-sm font-coinbase-sans">Manage your account preferences</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveTab('edit-profile')}
          className={`w-full text-left p-3 rounded-md font-coinbase-sans transition-colors duration-200 ${
            activeTab === 'edit-profile'
              ? 'bg-[#3CE7B2] text-[#121212]'
              : 'text-gray-400 hover:bg-[#2C2C2C] hover:text-[#3CE7B2]'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('two-factor')}
          className={`w-full text-left p-3 rounded-md font-coinbase-sans transition-colors duration-200 ${
            activeTab === 'two-factor'
              ? 'bg-[#3CE7B2] text-[#121212]'
              : 'text-gray-400 hover:bg-[#2C2C2C] hover:text-[#3CE7B2]'
          }`}
        >
          Two-Factor Authentication
        </button>
      </nav>
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('edit-profile')
  const dispatch = useDispatch()
  const userProfile = useSelector((state: any) => state.auth.userProfile)

  useEffect(() => {
    if (!userProfile) {
      dispatch(getUser() as any);
    }
  }, [dispatch, userProfile]);

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <NavHeader name="Settings" logout={true} />
      <div className="flex flex-1">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 px-5 pb-5">
          {activeTab === 'edit-profile' && <EditProfileCard user={userProfile}/>}
          {activeTab === 'two-factor' && <SetUpTwoFactor user={userProfile} />}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage