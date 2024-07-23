import mongoose from "mongoose";

const validateMongoIdFromParam = (req, res, next) => {
  //extract if from req.params
  const id = req.params.id;

  // check for mongo id validity
  const isvalidId = mongoose.isValidObjectId(id);

  // if not valid mongo id, throw error
  if (!isvalidId) {
    return res.status(400).send({ message: "Invalid mongo id." });
  }

  // call next function
  next();
};

export default validateMongoIdFromParam;
