const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const match = typeof authorization === "string"
    ? /^Bearer ([^\s]+)$/i.exec(authorization)
    : null;

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

module.exports = verifyToken;
