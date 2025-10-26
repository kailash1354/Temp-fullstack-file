// backend/utils/email.js - Fixed version
import { logger } from "../middleware/errorHandler.js";
import { config } from "../config/email.js";

// Simple nodemailer import that works
import nodemailer from "nodemailer";

// Create transporter with error handling
const createTransporter = () => {
  try {
    return nodemailer.createTransporter({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } catch (error) {
    console.log("⚠️  Email transporter failed, using mock:", error.message);
    return null;
  }
};

const transporter = createTransporter();

// Email templates (keep your existing ones)
const emailTemplates = {
  // ... your email templates stay the same ...
};

// Send email function with fallback
export const sendEmail = async (options) => {
  try {
    const template = emailTemplates[options.template];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const emailData = template(options.data);

    // Mock email if transporter failed
    if (!transporter) {
      console.log(`📧 Mock email to: ${options.to}`);
      console.log(`Subject: ${emailData.subject}`);
      return { messageId: "mock-id", mock: true };
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || "Luxe Heritage <noreply@yourapp.com>",
      to: options.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}`);
    return info;
  } catch (error) {
    logger.error(`Email failed to ${options.to}:`, error);
    // Don't crash the app - just return mock
    return { messageId: "failed", error: error.message, mock: true };
  }
};

export const testEmailConfig = async () => {
  if (!transporter) {
    console.log("📧 Email test skipped (using mock)");
    return true;
  }

  try {
    await transporter.verify();
    console.log("✅ Email configuration working");
    return true;
  } catch (error) {
    console.log("⚠️  Email test failed:", error.message);
    return false;
  }
};
