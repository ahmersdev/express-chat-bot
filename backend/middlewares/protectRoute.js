import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.chatBotJwtToken;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No Token Provided",
        status: 401,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - Invalid Token",
        status: 401,
        success: false,
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        status: 404,
        success: false,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      success: false,
    });
  }
};

export default protectRoute;
