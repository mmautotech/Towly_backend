const { z } = require("zod");

// ===================== 📝 Signup Validation Schema ===================== //
// Expects: username, phoneNo, password, and an optional role
const signupSchema = z.object({
  username: z
    .string({ required_error: "Username is required!" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(50, { message: "Username cannot exceed 50 characters!" })
    .regex(/^[A-Za-z0-9_ ]+$/, {
      message:
        "Username can only contain letters, numbers, underscores, and spaces.",
    }),
  phoneNo: z
    .string({ required_error: "Phone number is required." })
    .trim()
    .regex(
      /^\+92\d{10}$/,
      "Invalid phone number format. Expected format: +92XXXXXXXXXX."
    ),
  password: z
    .string({ required_error: "Password is required!" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .max(32, { message: "Password cannot exceed 32 characters!" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/, {
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character!",
    }),
  role: z.enum(["admin", "truck", "client"]).optional().default("client"),
});

// ===================== 📝 Login Validation Schema ===================== //
// Expects: phoneNo and password
const loginSchema = z.object({
  phoneNo: z
    .string({ required_error: "Phone number is required!" })
    .trim()
    .regex(
      /^\+92\d{10}$/,
      "Invalid phone number format. Expected format: +92XXXXXXXXXX."
    ),
  password: z.string({ required_error: "Password is required!" }).trim(),
});

// ===================== 📝 Forgot Password Schema ===================== //
// Expects: phoneNo and password (the new password)
const forgotPasswordSchema = z.object({
  phoneNo: z
    .string({ required_error: "Phone number is required." })
    .trim()
    .regex(
      /^\+92\d{10}$/,
      "Invalid phone number format. Expected format: +92XXXXXXXXXX."
    ),
  password: z
    .string({ required_error: "Password is required!" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .max(32, { message: "Password cannot exceed 32 characters!" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).*$/, {
      message:
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character!",
    }),
});

module.exports = { signupSchema, loginSchema, forgotPasswordSchema };
// ===================== 📝 Update Password Schema ===================== //
