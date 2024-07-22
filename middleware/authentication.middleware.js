import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const isUser = async (req, res, next) => {
  // extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 ? splittedArray[1] : null;

  // if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    // decrypt token
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    // if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized." });
  }

  // find user using email from payload
  const user = await User.findOne({ email: payload.email });

  // if not user, throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  req.loggedInUserId = user._id;

  // call next function
  next();
};

export const isSeller = async (req, res, next) => {
  // extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 ? splittedArray[1] : null;

  // if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    // decrypt token
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    // if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized." });
  }

  // find user using email from payload
  const user = await User.findOne({ email: payload.email });

  // if not user, throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  // if user role is not seller, throw error
  if (user.role !== "seller") {
    return res.status(401).send({ message: "Unauthorized." });
  }

  // add user._id as loggedInUserId
  req.loggedInUserId = user._id;

  // call next function
  next();
};

export const isBuyer = async (req, res, next) => {
  // extract token from req.headers
  const { authorization } = req.headers;

  const splittedArray = authorization?.split(" ");

  const token = splittedArray?.length === 2 ? splittedArray[1] : null;

  // if not token, throw error
  if (!token) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  let payload;
  try {
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

    // decrypt token
    payload = jwt.verify(token, secretKey);
  } catch (error) {
    // if decryption fails, throw error
    return res.status(401).send({ message: "Unauthorized." });
  }

  // find user using email from payload
  const user = await User.findOne({ email: payload.email });

  // if not user, throw error
  if (!user) {
    return res.status(401).send({ message: "Unauthorized." });
  }

  if (user.role !== "buyer") {
    return res.status(401).send({ message: "Unauthorized." });
  }

  req.loggedInUserId = user._id;

  // call next function
  next();
};
