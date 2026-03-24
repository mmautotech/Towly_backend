const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 🔍 Autocomplete (no location restriction)
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

                    // ✅ Hard bias to Pakistan
                    components: 'country:pk',

                    // ✅ Strong Lahore focus
                    location: '31.5204,74.3587',

                    // ✅ Tight radius (VERY IMPORTANT)
                    radius: 20000, // 20km
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