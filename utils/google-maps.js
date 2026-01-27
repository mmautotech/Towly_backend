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
    getDistanceAndETA,
};
