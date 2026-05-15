const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("BOUNCER: No token provided in headers!");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // THIS IS OUR WIRETAP
    console.log("====================================");
    console.log("BOUNCER REJECTED THE TOKEN!");
    console.log("Error reason:", err.message);
    console.log("Secret Bouncer is using:", process.env.JWT_SECRET);
    console.log("Token received:", token.substring(0, 15) + "...");
    console.log("====================================");

    res.status(401).json({ error: "Invalid token" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({ error: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };
