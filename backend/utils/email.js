import { logger } from "../middleware/errorHandler.js";

// Use require for nodemailer to avoid ES module issues
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Use a real email service in production
    return nodemailer.createTransporter({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  } else {
    // Use Ethereal for development
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  "email-verification": (data) => ({
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Luxe Heritage</h1>
            </div>
            <div class="content">
              <h2>Welcome to Luxe Heritage!</h2>
              <p>Hi ${data.firstName},</p>
              <p>Thank you for joining Luxe Heritage. Please verify your email address to complete your registration.</p>
              <a href="${data.verificationUrl}" class="button">Verify Email</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Luxe Heritage!

      Hi ${data.firstName},

      Thank you for joining Luxe Heritage. Please verify your email address to complete your registration.

      Click here to verify: ${data.verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account, please ignore this email.
    `,
  }),

  "password-reset": (data) => ({
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Luxe Heritage</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${data.firstName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${data.resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
              <p>This link will expire in 30 minutes.</p>
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>Luxe Heritage Security Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request

      Hi ${data.firstName},

      We received a request to reset your password. Click the link below to create a new password:

      ${data.resetUrl}

      This link will expire in 30 minutes.

      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    `,
  }),

  "order-confirmation": (data) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .order-details { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Luxe Heritage</h1>
            </div>
            <div class="content">
              <h2>Order Confirmation</h2>
              <p>Hi ${data.firstName},</p>
              <p>Thank you for your order! We're preparing your items for shipment.</p>

              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Total:</strong> $${data.total}</p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              </div>

              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@luxeheritage.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  "shipping-notification": (data) => ({
    subject: `Your Order Has Shipped - ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .tracking-info { background: #f9f9f9; padding: 20px; margin: 20px 0; }
            .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Luxe Heritage</h1>
            </div>
            <div class="content">
              <h2>Your Order Has Shipped!</h2>
              <p>Hi ${data.firstName},</p>
              <p>Great news! Your order has been shipped and is on its way to you.</p>

              <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Carrier:</strong> ${data.carrier}</p>
              </div>

              <p>You can track your package using the tracking number provided above.</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@luxeheritage.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async (options) => {
  try {
    // Get email template
    const template = emailTemplates[options.template];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const emailData = template(options.data);

    // Create email options
    const mailOptions = {
      from:
        process.env.FROM_EMAIL || "Luxe Heritage <noreply@luxeheritage.com>",
      to: options.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${options.to}`);

    // In development, log the preview URL
    if (process.env.NODE_ENV !== "production") {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("Email configuration is working correctly");
    return true;
  } catch (error) {
    console.error("Email configuration test failed:", error);
    return false;
  }
};
