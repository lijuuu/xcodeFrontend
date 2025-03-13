import React, { useEffect, useState } from 'react'
import ProfileCard from './components/ProfileCard'
import NavHeader from '@/components/sub/NavHeader';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setAuthLoading } from '@/redux/authSlice';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
// import EditProfileCard from './components/EditProfileCard';

const ProfilePageOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userProfile } = useSelector((state: any) => state.auth);

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
  const [loading, setLoading] = useState(false);
  return (
    <div className='min-h-screen w-full bg-night-black'>

      <NavHeader logout={true}  name="Profile" />
      {loading ? <div>Loading...</div> : <ProfileCard user={userProfile} />}
    </div>
  )
}

export default ProfilePageOverview
