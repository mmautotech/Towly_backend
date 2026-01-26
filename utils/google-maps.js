const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

/**
 * Places Autocomplete API
 * @param {string} input - Partial text entered by user
 * @param {string} [sessiontoken] - Optional session token for billing optimization
 */
const getPlaceAutocomplete = async (input, sessiontoken) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
        const params = {
            input,
            key: GOOGLE_API_KEY,
            sessiontoken,
            components: "country:pk", // limit to Pakistan; adjust as needed
        };
        const { data } = await axios.get(url, { params });
        return data;
    } catch (error) {
        console.error("Google Autocomplete API error:", error.message);
        throw new Error("Failed to fetch autocomplete suggestions");
    }
};

/**
 * Geocoding API: converts address -> coordinates
 * @param {string} address
 */
const geocodeAddress = async (address) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const params = { address, key: GOOGLE_API_KEY };
        const { data } = await axios.get(url, { params });
        if (data.status === "OK") {
            return data.results[0].geometry.location; // { lat, lng }
        }
        return null;
    } catch (error) {
        console.error("Geocode API error:", error.message);
        throw new Error("Failed to geocode address");
    }
};

/**
 * Reverse Geocoding API: converts coordinates -> human-readable address
 * @param {number} lat
 * @param {number} lng
 */
const reverseGeocode = async (lat, lng) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const params = { latlng: `${lat},${lng}`, key: GOOGLE_API_KEY };
        const { data } = await axios.get(url, { params });
        if (data.status === "OK") {
            return data.results[0].formatted_address;
        }
        return null;
    } catch (error) {
        console.error("Reverse Geocode API error:", error.message);
        throw new Error("Failed to reverse geocode coordinates");
    }
};

/**
 * Distance Matrix API: calculates distance and ETA between origin & destination
 * @param {object} origin - { lat, lng }
 * @param {object} destination - { lat, lng }
 */
const getDistanceAndETA = async (origin, destination) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
        const params = {
            origins: `${origin.lat},${origin.lng}`,
            destinations: `${destination.lat},${destination.lng}`,
            key: GOOGLE_API_KEY,
            units: "metric",
        };
        const { data } = await axios.get(url, { params });
        if (data.status === "OK") {
            const element = data.rows[0].elements[0];
            return {
                distance_text: element.distance?.text || "N/A",
                distance_value: element.distance?.value || 0,
                duration_text: element.duration?.text || "N/A",
                duration_value: element.duration?.value || 0,
            };
        }
        return null;
    } catch (error) {
        console.error("Distance Matrix API error:", error.message);
        throw new Error("Failed to fetch distance and ETA");
    }
};

module.exports = {
    getPlaceAutocomplete,
    geocodeAddress,
    reverseGeocode,
    getDistanceAndETA,
};
