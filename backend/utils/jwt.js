import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
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