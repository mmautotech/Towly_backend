const {
    getPlaceAutocomplete,
    geocodeAddress,
    reverseGeocode,
    getDistanceAndETA
} = require("../../utils/google-maps");

/**
 * @desc Get autocomplete suggestions for a typed location
 * @route GET /location/autocomplete
 * @query input, sessiontoken (optional)
 */
const placeAutocomplete = async (req, res) => {
    try {
        const { input, sessiontoken } = req.query;
        if (!input) return res.status(400).json({ success: false, message: "Input is required" });

        const suggestions = await getPlaceAutocomplete(input, sessiontoken);
        return res.json({ success: true, suggestions });
    } catch (error) {
        console.error("Place Autocomplete Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Convert address to coordinates
 * @route GET /location/geocode
 * @query address
 */
const geocode = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ success: false, message: "Address is required" });

        const location = await geocodeAddress(address);
        return res.json({ success: true, location });
    } catch (error) {
        console.error("Geocode Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Convert coordinates to address
 * @route GET /location/reverse-geocode
 * @query lat, lng
 */
const reverseGeocodeController = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ success: false, message: "Latitude & longitude are required" });

        const address = await reverseGeocode(parseFloat(lat), parseFloat(lng));
        return res.json({ success: true, address });
    } catch (error) {
        console.error("Reverse Geocode Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get distance and ETA between two points
 * @route GET /location/distance-eta
 * @query originLat, originLng, destLat, destLng
 */
const distanceETA = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng } = req.query;

        if (!originLat || !originLng || !destLat || !destLng) {
            return res.status(400).json({ success: false, message: "Origin and destination coordinates are required" });
        }

        const result = await getDistanceAndETA(
            { lat: parseFloat(originLat), lng: parseFloat(originLng) },
            { lat: parseFloat(destLat), lng: parseFloat(destLng) }
        );

        return res.json({ success: true, result });
    } catch (error) {
        console.error("Distance & ETA Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    placeAutocomplete,
    geocode,
    reverseGeocodeController,
    distanceETA,
};
