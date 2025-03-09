import React, { useState } from 'react'
import axios from 'axios'

type CountryData = {
  [key: string]: {
    name: string;
    image: string;
  };
};

const useCountries = () => {
  const [countries, setCountries] = useState<CountryData>({});
  const fetchCountries = async () => {
    try {
      const response:any = await axios.get("https://restcountries.com/v3.1/all");
  
      const countryData: CountryData = {};
      response.data.forEach((country: any) => {
        const code = country.cca2; 
        countryData[code] = {
          name: country.name.common,
          image: country.flags.svg, 
        };
      });
  
      setCountries(countryData);
    } catch (error) {
      console.error("Error fetching country data", error);
    }
  };
  return { countries, fetchCountries };
}

export default useCountries
