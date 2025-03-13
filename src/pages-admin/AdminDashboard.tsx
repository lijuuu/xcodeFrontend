import React from 'react'

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className='flex flex-col gap-4'> 
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold'>Users</h2>
          <p className='text-sm text-gray-500'>Total Users: 100</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
