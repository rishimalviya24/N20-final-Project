import { body } from "express-validator";
import redis from "../services/redis.service.js";
import userModel from "../models/user.js";
import jwt from "jsonwebtoken";

export const registerUserValidation = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3, max: 15 })
    .withMessage("Username must be between 3 and 15 characters")
    .custom((value) => value === value.toLowerCase())
    .withMessage("Username must be lowercase"),
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginUserValidation = [
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// export const authUser = async (req, res, next) => {
//   try {
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     console.log("Decoded Token:", jwt.decode(token));

//     const decoded = userModel.verifyToken(token);
//     if (!decoded ) {
//       return res.status(401).json({ message: "Invalid token" });
//       console.log(decoded);

//     }

//     let user = await redis.get(`user:${decoded._id}`);

//     console.log("User from Redis:", user);

//     if (!user) {
//       user = await userModel.findById(decoded._id);
//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
//       user = user.toObject(); // Ensure user is a plain object
//       delete user.password;
//       await redis.set(`user:${decoded._id}`, JSON.stringify(user));
//     } else {
//       user = JSON.parse(user); // Parse the cached user object
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Authentication error:", err);
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Decoded Token:", jwt.decode(token));

    const decoded = userModel.verifyToken(token);
    console.log("Decoded Token:", decoded);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let user = await redis.get(`user:${decoded._id}`);

    // console.log("User from Redis:", user);

    if (!user) {
      user = await userModel.findById(decoded._id);
      console.log("User from MongoDB:", user);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      user = user.toObject(); // Ensure user is a plain object
      delete user.password;
      await redis.set(`user:${decoded._id}`, JSON.stringify(user));
    } else {
      user = JSON.parse(user); // Parse the cached user object
    }

    req.user = user;
    req.tokenData = { token, ...decoded };
    
    next();

  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
