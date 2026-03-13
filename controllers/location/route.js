const axios = require("axios");

const geocode = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const res = await axios.get(url, {
        headers: { "User-Agent": "towly-app" }
    });

    if (!res.data.length) return null;

    return {
        lat: parseFloat(res.data[0].lat),
        lon: parseFloat(res.data[0].lon)
    };
};

exports.getRoute = async (req, res) => {
    try {

        const { from, to } = req.body;

        if (!from || !to) {
            return res.status(400).json({ message: "from and to required" });
        }

        const origin = await geocode(from);
        const destination = await geocode(to);

        if (!origin || !destination) {
            return res.status(404).json({ message: "Location not found" });
        }

        const routeURL =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${origin.lon},${origin.lat};${destination.lon},${destination.lat}` +
            `?overview=full&geometries=geojson`;

        const routeRes = await axios.get(routeURL);

        const route = routeRes.data.routes[0];

        res.json({
            origin,
            destination,
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry.coordinates
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};