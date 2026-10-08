import axios from 'axios';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ADDRESS_PRIORITY = [
  'street_address',
  'premise',
  'subpremise',
  'route',
  'neighborhood',
  'plus_code',
  'establishment',
  'point_of_interest',
];

const getAddressScore = (result = {}) => {
  const types = result.types || [];
  const firstMatchIndex = ADDRESS_PRIORITY.findIndex((type) => types.includes(type));
  return firstMatchIndex === -1 ? ADDRESS_PRIORITY.length : firstMatchIndex;
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.status === 'OK') {
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      if (!results.length) return null;

      const bestResult = [...results].sort((a, b) => getAddressScore(a) - getAddressScore(b))[0];
      const address = bestResult?.formatted_address || results[0]?.formatted_address || null;
      if (address) {
        return address;
      }
      return address;
    }
    return null;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    return null;
  }
};
