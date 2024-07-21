import mongoose from "mongoose";

// set schema rule
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  role: {
    type: String,
    required: true,
    enum: ["buyer", "seller"],
  },
});

userSchema.methods.toJSON = function () {
  var obj = this.toObject(); //or var obj = this;
  delete obj.password;
  return obj;
};

// create table/collection/model

const User = mongoose.model("user", userSchema);

export default User;
