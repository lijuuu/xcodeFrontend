import React from 'react'
import ProfileCard from './components/ProfileCard'
import { User } from '../../types/common'
import image from "../../assets/email.png"
import NavHeader from '@/components/sub/NavHeader'

const ProfilePage = () => {
  const user: User = {
    UserID: "1",
    UserName: "John Doe",
    FirstName: "John",
    LastName: "Doe",
    AvatarURL: image,
    Email: "john.doe@example.com",
    Role: "User",
    Status: "Active",
    Country: "United States",
    PrimaryLanguageID: "Golang",
    MuteNotifications: false,
    Socials: {
      Github: "https://github.com/john.doe",
      Twitter: "https://twitter.com/john.doe",
      Linkedin: "https://linkedin.com/in/john.doe",
    },
    CreatedAt: "2021-01-01",
  }

  return (
    <div className='min-h-screen w-full bg-night-black'>
      
      <NavHeader pages={[{name: "Problems", path: "/problems"},{name: "Compiler", path: "/compiler"} , {name: "Leaderboard", path: "/leaderboard"}, {name: "Chat", path: "/chat"}, {name: "Profile", path: "/"}]} name="Profile" />
      <ProfileCard user={user} />
    </div>
  )
}

export default ProfilePage
