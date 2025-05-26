// validators/auth-validator.js
const { z } = require("zod");

// ===================== 📝 Signup Validation Schema ===================== //
// Expects: username, phone, password, and an optional role
const signup_schema = z.object({
  user_name: z
    .string({ required_error: "Username is required!" })
    .trim()
    .min(3, "Username must be at least 3 characters long!")
    .max(50, "Username cannot exceed 50 characters!")
    .regex(/^[A-Za-z0-9_ ]+$/, "Only letters, numbers, underscores, spaces."),
  phone: z
    .string({ required_error: "Phone number is required." })
    .trim()
    .regex(/^\+44\d{10}$/, "Expected format: +44XXXXXXXXXX"),
  email: z
    .string({ required_error: "Email is required!" })
    .email("Invalid email format!"),
  password: z
    .string({ required_error: "Password is required!" })
    .trim()
    .min(8, "Must be at least 8 characters!")
    .max(32, "Cannot exceed 32 characters!")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&]).*$/,
      "Must include upper, lower, number & special char!"
    ),
  role: z.enum(["client", "driver", "admin"]).optional().default("client"),
});


// ===================== 📝 Login Validation Schema ===================== //
// Expects: phone and password
const login_schema = z.object({
  phone: signup_schema.shape.phone,
  password: signup_schema.shape.password,
});

// ===================== 📝 Forgot Password Schema ===================== //
// Expects: phone and password (the new password)
const forgot_password_schema = z.object({
  phone: signup_schema.shape.phone,
  password: signup_schema.shape.password,
});

module.exports = {
  signup_schema,
  login_schema,
  forgot_password_schema,
};
// ===================== 📝 Update Password Schema ===================== //
