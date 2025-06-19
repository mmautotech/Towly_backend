const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator-middleware");

const { signup_schema, login_schema, forgot_password_schema } = require("../validators/auth-validator");
const { registerUser, loginUser, forgotPassword } = require("../controllers/auth");

router.post("/register", validateRequest(signup_schema), registerUser);
router.post("/login", validateRequest(login_schema), loginUser);
router.post("/forgot-password", validateRequest(forgot_password_schema), forgotPassword);

module.exports = router;
