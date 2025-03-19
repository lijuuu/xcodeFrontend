import React from 'react'
import NavHeader from '@/components/sub/NavHeader'
import EditProfileCard from "@/pages-user/Profile/components/EditProfileCard"

const SettingsPage = () => {
  return (
    <div>
      <NavHeader name='Settings' logout={true} />
      <div className='flex flex-col items-center justify-center h-screen'>
        <EditProfileCard />
      </div>
    </div>
  )
}

export default SettingsPage
