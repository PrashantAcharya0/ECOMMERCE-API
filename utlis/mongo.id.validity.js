import mongoose from "mongoose";

const checkMongoIdsValidity = (id) => mongoose.isValidObjectId(id);

export default checkMongoIdsValidity;
