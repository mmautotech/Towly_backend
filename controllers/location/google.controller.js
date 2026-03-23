const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// London coordinates
const LONDON_LAT = 51.5074;
const LONDON_LNG = -0.1278;
const LONDON_RADIUS = 50000; // in meters (50 km)

// 🔍 Autocomplete (restricted to London, UK)
exports.searchPlaces = async (req, res) => {
    try {
        const { input } = req.query;

        if (!input) {
            return res.status(400).json({ message: 'Input is required' });
        }

        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/autocomplete/json',
            {
                params: {
                    input,
                    key: GOOGLE_API_KEY,
                    components: 'country:gb', // restrict to UK
                    location: `${LONDON_LAT},${LONDON_LNG}`, // bias to London
                    radius: LONDON_RADIUS, // 50km radius
                },
            }
        );

        res.json(response.data.predictions);
    } catch (err) {
        console.error('Autocomplete error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// 📍 Place details (no change needed)
exports.getPlaceDetails = async (req, res) => {
    try {
        const { placeId } = req.params;

        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    key: GOOGLE_API_KEY,
                },
            }
        );

        const loc = response.data.result.geometry.location;

        res.json({
            latitude: loc.lat,
            longitude: loc.lng,
        });
    } catch (err) {
        console.error('Details error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};