import SecurityIncident from "../models/securityIncident.js";
import User from "../models/user.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const currentIp = req.ip;

    if (decoded.ip && decoded.ip !== currentIp) {
      await SecurityIncident.create({
        type: "ip_change",
        userId: decoded.id,
        tokenIp: decoded.ip,
        requestIp: currentIp,
        userAgent: req.get("user-agent") || null,
      });

      return res.status(401).json({
        message: "IP address changed. Please obtain a new access token.",
      });
    }

    const user = await User.findById(decoded.id).select("-pwd");

    if (!user) {
      return res.status(401).json({
        message: "Invalid token user",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}