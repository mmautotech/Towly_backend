// services/notification.service.js

const twilio = require("twilio");
const nodemailer = require("nodemailer");

// === SMS via Twilio ===
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
if (!twilioSid || !twilioToken || !twilioFrom) {
  console.warn(
    "Twilio credentials not fully set; SMS notifications will fail if used."
  );
}
const smsClient = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;

/**
 * Send an SMS message.
 * @param {string} to E.164 phone number
 * @param {string} body
 * @returns {Promise<void>}
 */
async function sendSMS(to, body) {
  if (!smsClient) throw new Error("Twilio client not configured");
  await smsClient.messages.create({
    to,
    from: twilioFrom,
    body,
  });
}

// === Email via Nodemailer ===
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
let mailer = null;
if (emailHost && emailPort && emailUser && emailPass) {
  mailer = nodemailer.createTransport({
    host: emailHost,
    port: +emailPort,
    auth: { user: emailUser, pass: emailPass },
  });
} else {
  console.warn(
    "Email SMTP creds not set; email notifications will fail if used."
  );
}

/**
 * Send an email.
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} [html]
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, text, html) {
  if (!mailer) throw new Error("Email transporter not configured");
  await mailer.sendMail({ from: emailUser, to, subject, text, html });
}

module.exports = {
  sendSMS,
  sendEmail,
};
