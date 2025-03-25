import React, { useEffect, useRef, useState } from "react";
import imagesrc from "@/assets/triangle.png";
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt, FaEdit, FaCode } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { updateProfileImage, setAuthLoading } from "@/redux/authSlice";
import { toast } from "sonner";
import useCountries from "@/hooks/useCountries";
import { lang } from "@/constants/lang";
import useCloudinaryUpload from "@/hooks/useCloudinary";
import UserActivityCard from "./UserAcitivity";
import ProblemSolvingStats from "./ProblemSolvingStats";
import LoaderOverlay from "./LoaderOverlay";
import BadgesEarned from "./BadgesEarned";
import { useNavigate } from "react-router-dom";
import { Languages } from "lucide-react";
// Define ProfileCardProps
type ProfileCardProps = {
  user: any;
};


// Dummy data for recent submissions and badges
const dummyRecentSubmissions = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: ["Array", "Hash Table"], status: "Solved" },
  { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: ["String", "Sliding Window"], status: "Attempted" },
  { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: ["Array", "Binary Search"], status: "Solved" },
  { id: 4, title: "Add Two Numbers", difficulty: "Medium", category: ["Linked List", "Math"], status: "Solved" },
  { id: 5, title: "Longest Palindromic Substring", difficulty: "Medium", category: ["String", "Dynamic Programming"], status: "Attempted" },
];

const LanguageStats = () => {
  return (
    <div className="bg-[#1D1D1D] rounded-xl border border-[#2C2C2C] shadow-lg p-6 hover:border hover:border-gray-700 transition-all duration-300">
      <h1 className="text-xl font-semibold text-white mb-4 font-coinbase-display">Languages</h1>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-[#2C2C2C] p-3 rounded-md">
          <span className="text-sm text-gray-300 font-coinbase-sans">Golang</span>
          <div className="flex items-center text-sm">
            <span className="text-[#3CE7B2] font-coinbase-sans font-medium text-base">30</span>
            <span className="text-gray-500 ml-1">submissions</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-[#2C2C2C] p-3 rounded-md">
          <span className="text-sm text-gray-300 font-coinbase-sans">Python</span>
          <div className="flex items-center text-sm">
            <span className="text-[#3CE7B2] font-coinbase-sans font-medium text-base">10</span>
            <span className="text-gray-500 ml-1">submissions</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-[#2C2C2C] p-3 rounded-md">
          <span className="text-sm text-gray-300 font-coinbase-sans">C++</span>
          <div className="flex items-center text-sm">
            <span className="text-[#3CE7B2] font-coinbase-sans font-medium text-base">10</span>
            <span className="text-gray-500 ml-1">submissions</span>
          </div>
        </div>
        <div className="flex justify-between items-center bg-[#2C2C2C] p-3 rounded-md">
          <span className="text-sm text-gray-300 font-coinbase-sans">JavaScript</span>
          <div className="flex items-center text-sm">
            <span className="text-[#3CE7B2] font-coinbase-sans font-medium text-base">10</span>
            <span className="text-gray-500 ml-1">submissions</span>
          </div>
        </div>
      </div>
    </div>
  )
}


// ProfileCard Component
const ProfileCard = ({ user }: ProfileCardProps) => {
  const dispatch = useDispatch();
  const { userProfile } = user || {};
  const { uploadImage, loading, error, cancelUpload } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState(userProfile?.avatarURL || imagesrc);
  const { countries, fetchCountries } = useCountries();

  const handleEditPictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setProfilePic(uploadedUrl);
        dispatch(updateProfileImage({ avatarURL: uploadedUrl }) as any).then(() => {
          toast.success("Profile picture updated successfully");
        });
      }
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const navigate = useNavigate();


  return (
    <div>
      {loading && <LoaderOverlay onCancel={cancelUpload} />}
      <div className="container-main bg-[#121212] min-h-screen flex flex-col md:flex-row px-6 py-8 gap-6">
        {/* Left Container */}
        <div className="container-left w-full md:w-[30%] space-y-6">
          <div className="bg-[#1D1D1D] rounded-xl shadow-lg p-6 border border-[#2C2C2C] hover:border  hover:border-gray-700 transition-all duration-300">
            <div className="flex items-center mb-6 relative">
              <div className="relative">
                <img
                  src={userProfile?.avatarURL || imagesrc}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-[#3CE7B2]"
                />
                <button
                  onClick={handleEditPictureClick}
                  className="absolute bottom-0 right-0 bg-[#3CE7B2] p-1 rounded-full text-[#121212] hover:bg-[#27A98B] transition-colors duration-200"
                  disabled={loading}
                  aria-label="Edit profile picture"
                >
                  <FaEdit className="w-3 h-3" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex flex-col justify-between space-y-1">
                <div>
                  <p className="text-xl font-semibold text-white font-coinbase-display">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </p>
                  <p className="text-sm text-gray-400 font-coinbase-sans mt-1">@{userProfile?.userName}</p>
                  <p className="text-sm text-gray-400 font-coinbase-sans mt-1">{userProfile?.email}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#2C2C2C] text-[#3CE7B2] font-medium">Rank: 1</span>
                </div>
              </div>
            </div>
            {loading && <p className="text-sm text-gray-400 font-coinbase-sans">Uploading...</p>}
            {error && <p className="text-sm text-red-400 font-coinbase-sans">{error}</p>}
            <button
              className="bg-[#3CE7B2] text-[#121212] w-full px-4 py-2 rounded-md text-sm font-medium font-coinbase-sans hover:bg-[#3CE7B2] transition-colors duration-200"
              onClick={() => navigate("/settings/edit-profile")}
            >
              Edit Profile
            </button>
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400 font-coinbase-sans">
                <FaMapMarkerAlt className="text-gray-400 w-4 h-4" />
                <span className="flex items-center">
                  {countries[userProfile?.country]?.name || "Not Specified"}
                  {countries[userProfile?.country]?.image && (
                    <img src={countries[userProfile?.country]?.image} alt={countries[userProfile?.country]?.name} className="ml-2 w-4 h-4 rounded-full" />
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 font-coinbase-sans">
                <FaCode className="text-gray-400 w-4 h-4 mr-2" />
                {lang[userProfile?.primaryLanguageID]?.value.toUpperCase() || "Not Specified"}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-[#3CE7B2] font-coinbase-sans transition-colors duration-200">
                <FaGithub className="text-gray-400 w-4 h-4" />
                <a href={userProfile?.socials?.github || "#"} target="_blank" rel="noopener noreferrer">
                  {userProfile?.socials?.github || "Not Specified"}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-[#3CE7B2] font-coinbase-sans transition-colors duration-200">
                <FaTwitter className="text-gray-400 w-4 h-4" />
                <a href={userProfile?.socials?.twitter || "#"} target="_blank" rel="noopener noreferrer">
                  {userProfile?.socials?.twitter || "Not Specified"}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-[#3CE7B2] font-coinbase-sans transition-colors duration-200">
                <FaLinkedin className="text-gray-400 w-4 h-4" />
                <a href={userProfile?.socials?.linkedin || "#"} target="_blank" rel="noopener noreferrer">
                  {userProfile?.socials?.linkedin || "Not Specified"}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400 hover:text-[#3CE7B2] font-coinbase-sans transition-colors duration-200">
                <FaInstagram className="text-gray-400 w-4 h-4" />
                <a href={userProfile?.socials?.instagram || "#"} target="_blank" rel="noopener noreferrer">
                  {userProfile?.socials?.instagram || "Not Specified"}
                </a>
              </div>
            </div>
          </div>

          {/* Languages Card */}
          <LanguageStats />

        </div>

        {/* Right Container */}
        <div className="container-right w-full md:w-[70%] space-y-6">
          <div className="w-full">
            <UserActivityCard />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 h-full">
              <ProblemSolvingStats className="w-full pb-20" />
              {/* <LanguageStats /> */}

            </div>
            <BadgesEarned />
          </div>


          {/*Recent Problems*/}

          <div className="h-auto md:h-[400px] w-full bg-[#1D1D1D] rounded-xl shadow-lg p-6 overflow-y-auto border border-gray-800 hover:border-gray-700 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-4 font-coinbase-display">Recent Problems</h3>
            <div className="space-y-3">
              {dummyRecentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex justify-between items-center p-4 bg-[#2C2C2C] rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm text-white font-medium font-coinbase-sans">{submission.title}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium font-coinbase-sans ${submission.difficulty === "Easy"
                        ? "bg-emerald-900 text-emerald-400"
                        : submission.difficulty === "Medium"
                          ? "bg-yellow-900 text-yellow-400"
                          : "bg-red-900 text-red-400"}`
                      }>
                        {submission.difficulty}
                      </span>
                      {submission.category.map((category) => (
                        <span key={category} className="text-xs text-violet-400 font-coinbase-sans bg-gray-800 px-2 py-1 rounded-md">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium font-coinbase-sans ${submission.status === "Solved"
                      ? "bg-[#164F45] text-[#3CE7B2]"
                      : submission.status === "Attempted"
                        ? "bg-blue-900 text-blue-400"
                        : "bg-red-900 text-red-400"
                      }`}
                  >
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;