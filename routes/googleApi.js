// routes/googleApi.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/google-api-key
 * No auth required now
 */
router.get('/', (req, res) => {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) return res.status(500).json({ message: 'Google API key not configured' });

    console.log('🔑 Google API key requested');
    res.json({ apiKey: key });
});

module.exports = router;
