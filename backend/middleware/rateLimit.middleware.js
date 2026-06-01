import rateLimit from "express-rate-limit";
import SecurityIncident from "../models/securityIncident.js";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,

  handler: async (req, res) => {
    try {
      await SecurityIncident.create({
        type: "rate_limit",
        tokenIp: req.ip,
        requestIp: req.ip,
        userAgent: req.get("user-agent") || null,
      });
    } catch (error) {
      console.error("Failed to record rate limit incident:", error);
    }

    res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  },
});