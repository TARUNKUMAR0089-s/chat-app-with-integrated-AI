import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
 
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }


    if (!token) {
      console.log(" No token found in header or cookie");
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }


    const isBlackListed=await redisClient.get(token)

    if(isBlackListed){
      res.cookie('token','');
           return res.status(401).json({ error: "Unauthorized " });

    }
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);
    console.log("Token from header:", token);


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Token verified:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(" JWT Verify Error:", error.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
