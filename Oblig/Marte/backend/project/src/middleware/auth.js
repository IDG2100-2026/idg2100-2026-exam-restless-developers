// Simple auth middleware, not fully secure but works
// Grabs the user role and id from the request headers
// and adds them to req.user so the controllers can use them

const auth = (req, res, next) => {
  const role = req.headers["x-user-role"] || "anonymous";
  const userId = req.headers["x-user-id"] || null;

  req.user = { role, userId };
  next();
};

// Middleware to restrict access to registered users only
const requireUser = (req, res, next) => {
  if (req.user.role === "anonymous") {
    return res.status(401).json({ error: "You must be logged in to do this" });
  }
  next();
};

// Middleware to restrict access to admins only
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { auth, requireUser, requireAdmin };
