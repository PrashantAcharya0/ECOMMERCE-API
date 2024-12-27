import express from 'express';
import {
  loginUserValidationSchema,
  userValidationSchema,
} from './user.validation.js';
import User from './user.model.js';
import bcrypt from 'bcrypt';
import validateReqBody from '../middleware/validate.req.body.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// * register user
router.post(
  '/user/register',
  async (req, res, next) => {
    // extract data from req.body
    const data = req.body;

    try {
      // validate data
      const validateData = await userValidationSchema.validate(data);
      req.body = validateData;
    } catch (error) {
      // if validation fails , throw error
      return res.status(400).send({ message: error.message });
    }

    // call next function
    next();
  },
  async (req, res) => {
    // extract new user from req.body
    const newUser = req.body;
    // find user using email
    const user = await User.findOne({ email: newUser.email });

    // if user exists , throw error
    if (user) {
      return res.status(409).send({ message: 'Email already exists.' });
    }
    // hash password
    const plainPassword = newUser.password;
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRound);

    newUser.password = hashedPassword;
    //insert user
    await User.create(newUser);
    // sedn res
    return res
      .status(201)
      .send({ message: 'User is registered successfully.' });
  }
);

// * login
router.post(
  '/user/login',
  validateReqBody(loginUserValidationSchema),

  async (req, res) => {
    //extract login credentials from req body
    const loginCredentials = req.body;

    // find user using email
    const user = await User.findOne({ email: loginCredentials.email });
    // if mot user ,throw error
    if (!user) {
      return res.status(404).send({ message: 'Invalid credentials.' });
    }
    // compare password usiong bcrypt
    const plainPassword = loginCredentials.password;
    const hashedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(plainPassword, hashedPassword);

    // if not password match,throw error
    if (!isPasswordMatch) {
      return res.status(404).send({ message: 'Invalid credentials.' });
    }
    user.password = undefined; // to hide password
    // generate access token
    const payload = { email: user.email };
    const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const token = jwt.sign(payload, secretKey, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });
    // send res
    return res
      .status(200)
      .send({ message: 'success', userDetails: user, accessToken: token });
  }
);

// *list  registered users
router.get('/user/list', async (req, res) => {
  try {
    // Fetch all users and exclude the password field
    const users = await User.find().select('-password');
    // Send response with the list of users
    return res
      .status(200)
      .send({ message: 'Users fetched successfully.', users });
  } catch (error) {
    // Handle errors
    return res
      .status(500)
      .send({ message: 'Failed to fetch users.', error: error.message });
  }
});

// * delete user by ID
router.delete('/user/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(userId);

    // If no user is found, return a 404 response
    if (!deletedUser) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Send success response
    return res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    // Handle errors
    return res
      .status(500)
      .send({ message: 'Failed to delete user.', error: error.message });
  }
});

export default router;
