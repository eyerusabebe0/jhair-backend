const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // First try to find as User
    let user = await User.findById(decoded.id).select("-password");
    
    // If not found as User, try to find as Admin
    if (!user) {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (admin) {
        // Convert admin to user-like object with role
        user = {
          _id: admin._id,
          id: admin._id,
          email: admin.email,
          role: "admin"  // Give admin role so they can add products
        };
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User or Admin not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;