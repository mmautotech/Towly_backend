const express = require("express");
const router = express.Router();

const { getRoute } = require("../controllers/location/route");

router.post("/route", getRoute);

module.exports = router;