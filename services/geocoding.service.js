// services/geocoding.service.js

const axios = require("axios");
const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const apiKey = process.env.GEOCODING_API_KEY;
if (!apiKey) {
  throw new Error("GEOCODING_API_KEY is not set in environment");
}

/**
 * Convert a human address into { lat, lng }.
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeAddress(address) {
  const { data } = await axios.get(GEOCODING_API_URL, {
    params: { address, key: apiKey },
  });

  if (data.status !== "OK" || !data.results.length) {
    throw new Error(
      `Geocoding error: ${data.status} – ${data.error_message || "no result"}`
    );
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

/**
 * Convert coordinates back into a human-readable address.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
async function reverseGeocode(lat, lng) {
  const { data } = await axios.get(GEOCODING_API_URL, {
    params: { latlng: `${lat},${lng}`, key: apiKey },
  });

  if (data.status !== "OK" || !data.results.length) {
    throw new Error(
      `Reverse geocoding error: ${data.status} – ${
        data.error_message || "no result"
      }`
    );
  }

  return data.results[0].formatted_address;
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
};
