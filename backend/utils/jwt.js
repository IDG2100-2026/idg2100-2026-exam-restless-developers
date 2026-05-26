import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export function generateToken(user, ip) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      ip,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}