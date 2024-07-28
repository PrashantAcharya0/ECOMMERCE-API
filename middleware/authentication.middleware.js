import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const isUser = async (req, res, next) => {
  //extract token from req.headers
  const authorization = req.headers.authorization; //{ } => object destructure
  const splittedArray = authorization?.split(" ");
  const token = splittedArray?.length === 2 ? splittedArray[1] : null;
  //if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized..." });
  }
  //verify token
  let payload;
  //decrypt token
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    //if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //find user using email from payload
  const user = await User.findOne({ email: payload.email });
  //if not user throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  next();
};

export const isSeller = async (req, res, next) => {
  try {
    // extract token from req.headers

    const { authorization } = req.headers;

    const splittedArray = authorization?.split(" ");

    const token = splittedArray?.length === 2 ? splittedArray[1] : null;

    // if not token ,throw error
    if (!token) {
      throw new Error();
    }

    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    //  verify token
    const payload = jwt.verify(token, secretKey);

    // find user using email from payload
    const user = await User.findOne({ email: payload.email });

    // if not user found, throw error
    if (!user) {
      throw new Error();
    }

    // check if user role is "seller"
    //  if user role is not "seller", throw error
    if (user.role !== "seller") {
      throw new Error();
    }

    // attach user._id to req
    req.loggedInUserId = user._id;

    // call next function
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized." });
  }
};

export const isBuyer = async (req, res, next) => {
  //extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 ? splittedArray[1] : null;
  //if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  let payload;
  //decrypt token
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    //if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //find user using email from payload
  const user = await User.findOne({ email: payload.email });
  //if not user throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized..." });
  }

  //if user's role is not buyer, throw error
  if (user.role !== "buyer") {
    return res.status(401).send({ message: "Unauthorized" });
  }

  req.loggedInUserId = user._id;

  next();
};
