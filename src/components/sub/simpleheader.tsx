import React from 'react'
import { useNavigate } from 'react-router-dom';
const SimpleHeader = ({currentPage, name}: {currentPage: string, name: string}) => {
  const navigate = useNavigate();
  return (
    <>
       <header className="flex justify-between items-center px-6 py-4 bg-night-black ">
        <div className="text-2xl font-bold text-white font-coinbase-display hover:cursor-crosshair">
          xcode
        </div>
        <button
          onClick={() => navigate(currentPage)}
          className="text-sm text-white font-coinbase-sans hover:text-blue-600"
        >
          {name}
        </button>
      </header>
    </>
  )
}

export default SimpleHeader
