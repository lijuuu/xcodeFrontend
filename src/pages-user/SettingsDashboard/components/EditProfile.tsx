import React, { useEffect, useState } from "react";
import axios from "axios";
import useCountries from "@/hooks/useCountries";
import Cookies from "js-cookie";
import { lang } from "@/constants/lang";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "@/redux/authSlice";
import { toast } from "sonner";
import Loader1 from "@/components/ui/loader1";

// Define interfaces based on provided structs
interface Socials {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

interface UserProfile {
  userID: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
  email: string;
  role: string;
  country: string;
  isBanned: boolean;
  isVerified: boolean;
  primaryLanguageID: string;
  muteNotifications: boolean;
  socials: Socials;
  createdAt: number;
}

// Fake delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LoaderOverlay Component
const LoaderOverlay: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] bg-opacity-95 z-50 rounded-lg">
    <Loader1 className="w-12 h-12 text-[#3CE7B2]" />
    <div className="text-white text-lg opacity-80 font-coinbase-sans mt-4">
      Saving...
    </div>
    <button
      onClick={onCancel}
      className="text-gray-400 text-sm font-coinbase-sans mt-3 underline hover:text-[#3CE7B2] transition-colors duration-200"
    >
      Cancel
    </button>
  </div>
);

const EditProfileCard = () => {
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [primaryLanguageID, setPrimaryLanguageID] = useState("");
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user profile from Redux store
  const userProfile = useSelector((state: any) => state.auth.userProfile) as UserProfile | undefined;

  // Populate form with user profile data
  useEffect(() => {
    if (userProfile) {
      setUserName(userProfile.userName || "");
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setCountry(userProfile.country || "");
      setPrimaryLanguageID(userProfile.primaryLanguageID || "");
      setMuteNotifications(userProfile.muteNotifications || false);
      setGithub(userProfile.socials?.github || "");
      setTwitter(userProfile.socials?.twitter || "");
      setLinkedin(userProfile.socials?.linkedin || "");
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profileData = {
        userName,
        firstName,
        lastName,
        country,
        primaryLanguageID,
        muteNotifications,
        socials: { github, twitter, linkedin },
      };
      const accessToken = Cookies.get("accessToken");
      await delay(500); // 0.5-second fake delay
      await axios.put(`http://localhost:7000/api/v1/users/profile/update`, profileData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Profile updated successfully", { style: { background: "#1D1D1D", color: "#3CE7B2" } });
      dispatch(getUser() as any);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", { style: { background: "#1D1D1D", color: "#FFFFFF" } });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if userProfile is not yet available
  if (!userProfile) {
    return (
      <div className="w-full max-w-3xl bg-[#1D1D1D] rounded-xl p-8 shadow-lg font-coinbase-sans text-white">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <p className="text-gray-400">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-[#1D1D1D] rounded-xl p-8 shadow-lg font-coinbase-sans relative">
      {loading && <LoaderOverlay onCancel={() => setLoading(false)} />}
      <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              required
              disabled={loading}
            />
          </div>
          <div>
            <CountriesWithFlags selectedCountry={country} onSelect={setCountry} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Primary Language</label>
            <select
              value={primaryLanguageID}
              onChange={(e) => setPrimaryLanguageID(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              required
              disabled={loading}
            >
              <option value="">Select Language</option>
              {Object.entries(lang).map(([key, value]) => (
                <option key={key} value={key}>{value.value}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={muteNotifications}
              onChange={(e) => setMuteNotifications(e.target.checked)}
              className="mr-2 h-4 w-4 text-[#3CE7B2] focus:ring-[#3CE7B2] rounded"
              disabled={loading}
            />
            <label className="text-sm font-medium text-white">Mute Notifications</label>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Social Links</h3>
          <div>
            <label className="block text-sm font-medium text-white mb-1">GitHub</label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Twitter</label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">LinkedIn</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full bg-[#2C2C2C] p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#3CE7B2] text-[#121212] px-8 py-2.5 rounded-md hover:bg-[#27A98B] transition-colors duration-200 font-medium disabled:bg-[#27A98B] disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CountriesWithFlags = ({ selectedCountry, onSelect, disabled }: { selectedCountry: string; onSelect: (code: string) => void; disabled?: boolean }) => {
  const { countries, fetchCountries } = useCountries();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleSelect = (code: string) => {
    if (!disabled) {
      onSelect(code);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative w-full font-coinbase-sans">
      <label className="block text-sm font-medium text-white mb-1">Country</label>
      <div
        className={`flex items-center justify-between bg-[#2C2C2C] text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3CE7B2] transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
      >
        {selectedCountry && countries[selectedCountry] ? (
          <div className="flex items-center space-x-2">
            <img
              src={countries[selectedCountry].image}
              alt={`${countries[selectedCountry].name} flag`}
              className="w-5 h-5"
            />
            <span>{countries[selectedCountry].name}</span>
          </div>
        ) : (
          <span>Select a country</span>
        )}
        <span className="text-gray-400">▼</span>
      </div>
      {dropdownOpen && !disabled && (
        <div className="absolute w-full bg-[#2C2C2C] text-white mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg z-10">
          {Object.entries(countries)
            .sort((a: any, b: any) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]: any) => (
              <div
                key={code}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-[#3CE7B2] hover:text-[#121212] cursor-pointer"
                onClick={() => handleSelect(code)}
              >
                <img src={data.image} alt={`${data.name} flag`} className="w-5 h-5" />
                <span>{data.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default EditProfileCard;