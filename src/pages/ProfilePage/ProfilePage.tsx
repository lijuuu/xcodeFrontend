import React, { useEffect, useState } from 'react'
import ProfileCard from './components/ProfileCard'
import NavHeader from '@/components/sub/NavHeader';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setAuthLoading } from '@/redux/authSlice';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import EditProfileCard from './components/EditProfileCard';
import Loader1 from '@/components/ui/loader1';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const user: User = {
  //   UserID: "1",
  //   UserName: "John Doe",
  //   FirstName: "John",
  //   LastName: "Doe",
  //   AvatarURL: image,
  //   Email: "john.doe@example.com",
  //   Role: "User",
  //   Status: "Active",
  //   Country: "United States",
  //   PrimaryLanguageID: "Golang",
  //   MuteNotifications: false,
  //   Socials: {
  //     Github: "https://github.com/john.doe",
  //     Twitter: "https://twitter.com/john.doe",
  //     Linkedin: "https://linkedin.com/in/john.doe",
  //   },
  //   CreatedAt: "2021-01-01",
  // }

  const { userProfile, loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      dispatch(getUser() as any);
      console.log(userProfile);
    }
    else {
      navigate("/login");
    }
  }, []);

  console.log("userProfile ", userProfile);
  const [editModel, setEditModel] = useState(false);

  // --- Loader Overlay Component ---
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
    <Loader1 className="w-12 h-12 mr-10 text-blue-800" />
    <div className="text-white text-xl opacity-80 font-coinbase-sans mt-24">
      Logging in...
    </div>
    <button
      onClick={onCancel}
      className="text-white text-sm font-coinbase-sans mt-4 underline hover:text-blue-800 transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
);  


  return (
    <div className='min-h-screen w-full bg-night-black'>

      {loading && <LoaderOverlay onCancel={() => dispatch(setAuthLoading(false))} />}
      <NavHeader logout={true} pages={[{ name: "Problems", path: "/problems" }, { name: "Compiler", path: "/compiler" }, { name: "Leaderboard", path: "/leaderboard" }, { name: "Chat", path: "/chat" }, { name: "Profile", path: "/" }, { name: "Home", path: "/home" }]} name="Profile" />
      {loading ? <div>Loading...</div> : <ProfileCard user={userProfile} setEditModel={setEditModel} />}
      {editModel && <EditProfileCard user={userProfile} setEditModel={setEditModel} />}
    </div>
  )
}

export default ProfilePage
