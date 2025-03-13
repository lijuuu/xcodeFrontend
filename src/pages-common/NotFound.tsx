import React from 'react'
import NavHeader from '@/components/sub/NavHeader'

const NotFound = () => {
  return (
    <div className='min-h-screen w-full bg-night-black'>
      <NavHeader logout={false} pages={[{ name: "Home", path: "/home" }, { name: "Profile", path: "/" }, { name: "Problems", path: "/problems" }, { name: "Compiler", path: "/compiler" }, { name: "Leaderboard", path: "/leaderboard" }, { name: "Chat", path: "/chat" }, { name: "Settings", path: "/settings" }]} name="NotFound" />
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-white text-4xl font-bold'>404</h1>
        <p className='text-white text-2xl'>Page Not Found</p>
      </div>
    </div>
  )
}

export default NotFound
