import React, { useEffect, useState } from "react";
import axios from "axios";
// @ts-ignore
import useCountries from "@/hooks/useCountries";
import Cookies from "js-cookie";
import { lang } from "@/constants/lang";
import { useDispatch } from "react-redux";
import { getUser } from "@/redux/authSlice";
import { toast } from "sonner";

const EditProfileCard = ({ user }: { user: any }) => {
  const dispatch = useDispatch();
  // Form state
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [primaryLanguageID, setPrimaryLanguageID] = useState("");
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { userProfile } = user;

  // Populate form with user profile data on mount
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
  }, [userProfile]); // Added userProfile as dependency

  console.log("user ", user);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await axios.put(`http://localhost:7000/api/v1/users/profile/update`, profileData, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      toast.success("Profile updated successfully");
      dispatch(getUser() as any);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="w-full  bg-[#1D1D1D] rounded-lg p-8 shadow-lg  font-coinbase-sans">
      <h1 className="text-3xl font-bold mb-6 text-white">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-white">Username</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
            required
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-white">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-white">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
            required
          />
        </div>

        {/* Country Selection */}
        <CountriesWithFlags selectedCountry={country} onSelect={setCountry} />

        {/* Primary Language */}
        <div>
          <label className="block text-sm font-medium text-white">Primary Language</label>
          <select
            value={primaryLanguageID}
            onChange={(e) => setPrimaryLanguageID(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
            required
          >
            <option value="">Select Language</option>
            {Object.entries(lang).map(([key, value]) => (
              <option key={key} value={key}>{value.value}</option>
            ))}
          </select>
        </div>

        {/* Mute Notifications */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={muteNotifications}
            onChange={(e) => setMuteNotifications(e.target.checked)}
            className="mr-2 h-4 w-4 text-[#3CE7B2] focus:ring-[#3CE7B2] rounded"
          />
          <label className="text-sm font-medium text-white">Mute Notifications</label>
        </div>

        {/* Social Media Links */}
        <div>
          <label className="block text-sm font-medium text-white">GitHub</label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Twitter</label>
          <input
            type="url"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">LinkedIn</label>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full bg-[#2C2C2C] p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#3CE7B2] text-[#121212] px-6 py-3 rounded hover:bg-[#27A98B] transition-colors duration-200 w-full md:w-auto"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

// Updated CountriesWithFlags Component
const CountriesWithFlags = ({ selectedCountry, onSelect }: { selectedCountry: string; onSelect: (code: string) => void }) => {
  const { countries, fetchCountries } = useCountries();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleSelect = (code: string) => {
    onSelect(code);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full font-coinbase-sans">
      <label className="block text-sm font-medium text-white">Country</label>
      <div
        className="flex items-center justify-between bg-[#2C2C2C] text-white p-3 rounded mt-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CE7B2]"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCountry && countries[selectedCountry] ? (
          <div className="flex items-center space-x-2">
            <img
              src={countries[selectedCountry].image}
              alt={`${countries[selectedCountry].name} flag`}
              className="w-6 h-6"
            />
            <span>{countries[selectedCountry].name}</span>
          </div>
        ) : (
          <span>Select a country</span>
        )}
        <span>▼</span>
      </div>
      {dropdownOpen && (
        <div className="absolute w-full bg-[#2C2C2C] text-white mt-2 max-h-60 overflow-y-auto rounded shadow-lg z-10">
          {Object.entries(countries)
            .sort((a: any, b: any) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]: any) => (
              <div
                key={code}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-[#3CE7B2] hover:text-[#121212] cursor-pointer"
                onClick={() => handleSelect(code)}
              >
                <img src={data.image} alt={`${data.name} flag`} className="w-6 h-6" />
                <span>{data.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default EditProfileCard;