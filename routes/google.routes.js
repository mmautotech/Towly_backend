const express = require('express');
const router = express.Router();

const {
    searchPlaces,
    getPlaceDetails,
} = require('../controllers/location/google.controller');

// 🔍 Autocomplete
router.get('/autocomplete', searchPlaces);

// 📍 Place details
router.get('/details/:placeId', getPlaceDetails);

module.exports = router;