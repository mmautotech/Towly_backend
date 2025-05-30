// services/geoUtils.js

/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula: distance between two [lng, lat] points in meters.
 * @param {[number, number]} coord1 [lng, lat]
 * @param {[number, number]} coord2 [lng, lat]
 * @returns {number}
 */
function calculateDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371e3; // Earth radius in meters

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Compute a bounding box [minLng, minLat, maxLng, maxLat] around a center point.
 * @param {[number, number]} center [lng, lat]
 * @param {number} radiusMeters
 * @returns {[number, number, number, number]}
 */
function getBoundingBox(center, radiusMeters) {
  const [lng, lat] = center;
  const latDelta = (radiusMeters / 111320); // approx degrees per meter
  const lngDelta = radiusMeters / (111320 * Math.cos(toRad(lat)));

  return [
    lng - lngDelta,
    lat - latDelta,
    lng + lngDelta,
    lat + latDelta,
  ];
}

module.exports = {
  calculateDistance,
  getBoundingBox,
};
