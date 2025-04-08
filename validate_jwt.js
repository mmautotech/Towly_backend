// Load environment variables so that JWT_SECRET_KEY can be accessed
require("dotenv").config();

const jwt = require("jsonwebtoken");

// Use the secret key from the environment variables
const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  console.error("JWT_SECRET_KEY is not set in the environment.");
  process.exit(1);
}

// The token to validate (in a real scenario, this would be passed in)
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2U2ZTQwYTUzYjRmNzJkMzQ5MGJiNyIsImVtYWlsIjoidXNlckB5YWhvby5jb20iLCJwaG9uZSI6IjAwOTItMzAwLTEyMzQ1Njc4Iiwicm9sZSI6InVzZXIiLCJkYXRlIjoiMjAyNS0wMS0wOFQxOTozNzo0MC4xMzFaIiwiaWF0IjoxNzM2MzY1MDYwLCJleHAiOjE3MzYzNjg4NjB9.kFRpz8gwMtt6WirHqGIQ3B_ZTm_2iMhZ7PYDA-052I4";

try {
  // Verify the token using the secret key
  const decoded = jwt.verify(token, secretKey);
  console.log("Decoded Token:", decoded);
} catch (error) {
  console.error("Invalid Token:", error.message);
}
