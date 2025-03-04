import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "@/redux/xCodeAuth";
import { Avatar, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn/ui components
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, error } = useSelector((state: any) => state.xCodeAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUser() as any);
  }, [dispatch]);

  // Fallback data if user is not loaded yet, using the provided JSON structure
  const userProfile = user?.payload?.userProfile || {
    userID: "",
    userName: "",
    firstName: "Blue",
    lastName: "Woprl",
    avatarURL: "",
    email: "user@gmail.com",
    role: "",
    country: "",
    isBanned: false,
    isVerified: false,
    primaryLanguageID: "",
    muteNotifications: false,
    socials: { github: "", twitter: "", linkedin: "" },
    createdAt: 0,
  };

  if (error) {
    return <div className="text-white">Error: {error.details}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 w-full max-w-4xl mx-auto">
        <div className="text-xl font-semibold">xcode</div>
        <div className="space-x-6">
          <Link to="/" className="hover:text-gray-400 text-lg">
            Home
          </Link>
          <Link to="/ranking" className="hover:text-gray-400 text-lg">
            Ranking
          </Link>
          <Link to="/problems" className="hover:text-gray-400 text-lg">
            Problems
          </Link>
          <Link to="/compiler" className="hover:text-gray-400 text-lg">
            Compiler
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-black rounded-lg p-8 shadow-md max-w-4xl mx-auto border border-gray-800">
        <div className="flex items-center space-x-8 mb-6">
          <Avatar className="w-32 h-32 border-2 border-gray-700">
            <AvatarImage
              src={userProfile.avatarURL || "/triangle.png"}
              alt={`${userProfile.firstName} ${userProfile.lastName}`}
              className="object-cover"
            />
          </Avatar>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="text-gray-400 text-lg">@{userProfile.userName || "Not specified"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-lg">
          <p><span className="font-semibold">Email:</span> {userProfile.email}</p>
          <p><span className="font-semibold">User ID:</span> {userProfile.userID}</p>
          <p><span className="font-semibold">Role:</span> {userProfile.role || "Not specified"}</p>
          <p><span className="font-semibold">Country:</span> {userProfile.country || "Not specified"}</p>
          <p><span className="font-semibold">Banned:</span> {userProfile.isBanned ? "Yes" : "No"}</p>
          <p><span className="font-semibold">Verified:</span> {userProfile.isVerified ? "Yes" : "No"}</p>
          <p><span className="font-semibold">Primary Language ID:</span> {userProfile.primaryLanguageID || "Not specified"}</p>
          <p><span className="font-semibold">Mute Notifications:</span> {userProfile.muteNotifications ? "Yes" : "No"}</p>
          <p><span className="font-semibold">Created At:</span> {userProfile.createdAt === 0 ? "Not specified" : new Date(userProfile.createdAt * 1000).toLocaleString()}</p>
          <p><span className="font-semibold">GitHub:</span> {userProfile.socials.github || "Not specified"}</p>
          <p><span className="font-semibold">Twitter:</span> {userProfile.socials.twitter || "Not specified"}</p>
          <p><span className="font-semibold">LinkedIn:</span> {userProfile.socials.linkedin || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;