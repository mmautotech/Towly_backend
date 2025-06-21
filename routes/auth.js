const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validator-middleware");

const { signup_schema, login_schema, forgot_password_schema } = require("../validators/auth-validator");
const auth = require("../controllers/auth");

router.post("/login", validateRequest(login_schema), auth.loginUser);
router.post("/register", validateRequest(signup_schema), auth.registerUser);
router.post("/register-trucker", validateRequest(signup_schema), auth.registerTrucker);
router.post("/forgot-password", validateRequest(forgot_password_schema), auth.forgotPassword);


module.exports = router;
