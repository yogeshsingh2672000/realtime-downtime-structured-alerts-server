import { Router, Request, Response } from "express";
import { z } from "zod";
import { sendDowntimeAlert, sendUptimeAlert } from "../../services/sendEmail.js";
import { authenticateToken } from "../../middleware/auth.js";

const emailTriggerSchema = z.object({
  emailType: z.enum(["uptime", "downtime"]),
  emailAddress: z.string().email(),
  modelName: z.string().min(1),
  serviceName: z.string().min(1).optional(),
  duration: z.string().min(1).optional(),
  additionalInfo: z.string().optional(),
});

export const emailRouter = Router();

// POST /api/email/trigger
emailRouter.post("/trigger", authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized', message: 'User not authenticated' });
    }

    const parsed = emailTriggerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "invalid_body",
        details: parsed.error.issues 
      });
    }

    const { emailType, emailAddress, modelName, serviceName, duration, additionalInfo } = parsed.data;
    
    // Use modelName as serviceName if not provided
    const service = serviceName || modelName;
    // Use default duration if not provided
    const timeDuration = duration || "Unknown duration";

    let emailSent = false;

    if (emailType === "downtime") {
      emailSent = await sendDowntimeAlert(
        emailAddress,
        service,
        timeDuration,
        additionalInfo
      );
    } else if (emailType === "uptime") {
      emailSent = await sendUptimeAlert(
        emailAddress,
        service,
        timeDuration,
        additionalInfo
      );
    }

    if (emailSent) {
      return res.status(200).json({
        ok: true,
        message: `${emailType} alert email sent successfully`,
        details: {
          emailType,
          emailAddress,
          modelName: service,
          duration: timeDuration,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(500).json({
        error: "email_send_failed",
        message: "Failed to send email"
      });
    }
  } catch (error) {
    console.error("Error in email trigger endpoint:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred"
    });
  }
});

// GET /api/email/test
emailRouter.get("/test", async (req: Request, res: Response) => {
  try {
    const testEmail = req.query.email as string;
    if (!testEmail) {
      return res.status(400).json({
        error: "missing_email",
        message: "Email query parameter is required"
      });
    }

    // Send a test uptime alert
    const emailSent = await sendUptimeAlert(
      testEmail,
      "Test Service",
      "1 minute",
      "This is a test email to verify email functionality"
    );

    if (emailSent) {
      return res.status(200).json({
        ok: true,
        message: "Test email sent successfully",
        details: {
          emailAddress: testEmail,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(500).json({
        error: "email_send_failed",
        message: "Failed to send test email"
      });
    }
  } catch (error) {
    console.error("Error in email test endpoint:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred"
    });
  }
});
