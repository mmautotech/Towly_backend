// scripts/validate_jwt.js

// Standalone JWT checker — usage: `node scripts/validate_jwt.js <token>`

require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  console.error("❌ JWT_SECRET_KEY is not set in the environment.");
  process.exit(1);
}

const [token] = process.argv.slice(2);
if (!token) {
  console.error("Usage: node scripts/validate_jwt.js <jwt-token>");
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, secretKey);
  console.log("✅ Token is valid. Decoded payload:\n", decoded);
  process.exit(0);
} catch (err) {
  console.error("❌ Invalid token:", err.message);
  process.exit(1);
}
