/*
const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Reverse geocode coordinates to a human-readable address using Google Maps API
 * @param {number[]} coordinates - [longitude, latitude]
 * @returns {Promise<string>} formatted address
 *
async function reverseGeocode([lng, lat]) {
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);

        if (response.data.status === "OK" && response.data.results.length > 0) {
            // Prefer street-level addresses first
            const streetResult = response.data.results.find(r =>
                r.types.includes("street_address") ||
                r.types.includes("premise") ||
                r.types.includes("route")
            );

            return streetResult?.formatted_address || response.data.results[0].formatted_address;
        }

        return "";
    } catch (err) {
        console.error("Reverse Geocode Error:", err.message || err);
        return "";
    }
}

module.exports = reverseGeocode;
*/
