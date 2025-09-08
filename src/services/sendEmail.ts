import nodemailer from 'nodemailer';
import { EmailConfig, EmailParams } from '../types/service/sendEmail.js';
import { requireEnv } from '../utils/common.js';

// Hardcoded sender email configuration
const EMAIL_CONFIG: EmailConfig = {
  host: 'smtp.gmail.com', // You can change this to your preferred SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: requireEnv('EMAIL_USERNAME'),
    pass: requireEnv('EMAIL_APP_PASSWORD'),
  }
};

// Create reusable transporter object
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * Send email using nodemailer
 * @param params - Email parameters including recipient, subject, and content
 * @returns Promise<boolean> - Returns true if email was sent successfully
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Validate required parameters
    if (!params.to || !params.subject || (!params.text && !params.html)) {
      throw new Error('Missing required email parameters: to, subject, and either text or html');
    }

    // Prepare email options
    const mailOptions = {
      from: `"Downtime Alerts" <${EMAIL_CONFIG.auth.user}>`,
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      cc: params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : undefined,
      bcc: params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Verify email configuration
 * @returns Promise<boolean> - Returns true if configuration is valid
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

/**
 * Send a simple text email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param text - Email text content
 * @returns Promise<boolean> - Returns true if email was sent successfully
 */
export async function sendSimpleEmail(to: string, subject: string, text: string): Promise<boolean> {
  return sendEmail({ to, subject, text });
}

/**
 * Send an HTML email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @returns Promise<boolean> - Returns true if email was sent successfully
 */
export async function sendHtmlEmail(to: string, subject: string, html: string): Promise<boolean> {
  return sendEmail({ to, subject, html });
}

/**
 * Send a downtime alert email
 * @param to - Recipient email address
 * @param serviceName - Name of the service that is down
 * @param downtimeDuration - How long the service has been down
 * @param additionalInfo - Any additional information about the downtime
 * @returns Promise<boolean> - Returns true if email was sent successfully
 */
export async function sendDowntimeAlert(
  to: string, 
  serviceName: string, 
  downtimeDuration: string, 
  additionalInfo?: string
): Promise<boolean> {
  const subject = `🚨 Downtime Alert: ${serviceName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">🚨 Service Downtime Alert</h2>
      <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #d32f2f;">
        <h3 style="color: #d32f2f; margin-top: 0;">Service: ${serviceName}</h3>
        <p><strong>Downtime Duration:</strong> ${downtimeDuration}</p>
        <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
        ${additionalInfo ? `<p><strong>Additional Information:</strong> ${additionalInfo}</p>` : ''}
      </div>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        This is an automated alert from the Downtime Monitoring System.
      </p>
    </div>
  `;
  
  return sendEmail({ to, subject, html });
}
