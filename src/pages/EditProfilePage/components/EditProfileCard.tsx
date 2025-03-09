import React, { useEffect, useState } from "react";
// @ts-ignore
import useCountries from "@/hooks/useCountries";

const EditProfileCard = () => {
  return (
    <div>
      <CountriesWithFlags />
    </div>
  );
};

export default EditProfileCard;

const CountriesWithFlags = () => {
  const { countries, fetchCountries } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCountry(code);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-64">
      <label className="text-white">Country</label>

      {/* Selected Country Display */}
      <div
        className="flex items-center justify-between bg-black text-white p-2 rounded cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCountry ? (
          <div className="flex items-center space-x-2">
            <img
              src={countries[selectedCountry]?.image}
              alt={`${countries[selectedCountry]?.name} flag`}
              className="w-6 h-6"
            />
            <span>{countries[selectedCountry]?.name}</span>
          </div>
        ) : (
          <span>Select a country</span>
        )}
        <span>▼</span>
      </div>

      {/* Dropdown Options */}
      {dropdownOpen && (
        <div className="absolute w-full bg-gray-800 text-white mt-2 max-h-60 overflow-y-auto rounded shadow-lg z-10">
          {Object.entries(countries).sort((a:any, b:any) => a[1].name.localeCompare(b[1].name)).map(([code, data]: any) => (
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
