import React, { useEffect, useState } from "react";
import axios from "axios"; // For API requests
// @ts-ignore
import useCountries from "@/hooks/useCountries";
import Cookies from "js-cookie";
import { lang } from "@/constants/lang";
const EditProfileCard = ({ user, setEditModel }: { user: any, setEditModel: (editModel: boolean) => void }) => {
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
  }, []);

  console.log("user ", user);

  // Mock Cloudinary upload function (replace with actual implementation)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset");
    const response = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.secure_url;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let avatarURL = null;
      if (avatarFile) {
        avatarURL = await uploadToCloudinary(avatarFile);
        await axios.patch(`http://localhost:7000/api/v1/users/profile/image`, { avatarURL });
      }

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

      alert("Profile updated successfully"); // Replace with toast notification
      setEditModel(false); // Close modal on success
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile"); // Replace with error toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-4xl bg-night-black rounded-lg p-8 shadow-lg max-h-[80vh] overflow-y-auto font-coinbase-sans">
        {/* Close Button */}
        <button
          onClick={() => setEditModel(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 text-xl"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold mb-6 text-white">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
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
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
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
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
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
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              required
            >
              <option value="">Select Language</option>
              {Object.entries(lang).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
              {/* Add more languages as needed */}
            </select>
          </div>

          {/* Mute Notifications */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={muteNotifications}
              onChange={(e) => setMuteNotifications(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-700 focus:ring-blue-700 rounded"
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
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Twitter</label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">LinkedIn</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded mt-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-gray-700 p-3 rounded mt-1 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-700 file:text-white hover:file:bg-blue-800"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800 transition-colors duration-200 w-full md:w-auto"
          >
            Save Changes
          </button>
        </form>
      </div>
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
        className="flex items-center justify-between bg-gray-700 text-white p-3 rounded mt-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
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
        <div className="absolute w-full bg-gray-800 text-white mt-2 max-h-60 overflow-y-auto rounded shadow-lg z-10">
          {Object.entries(countries)
            .sort((a: any, b: any) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]: any) => (
              <div
                key={code}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
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