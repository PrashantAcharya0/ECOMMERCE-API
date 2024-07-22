import express from "express";
import { isSeller, isUser } from "../middleware/authentication.middleware.js";
import Product from "./product.model.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addProductValidationSchema } from "./product.validation.js";

const router = express.Router();

// * list all products
router.get("/product/list", isUser, async (req, res) => {
  // find all products
  const products = await Product.find();

  // send res
  return res.status(200).send({ message: "success", productList: products });
});

// * add product
router.post(
  "/product/add",
  isSeller,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract new product from req.body
    const newProduct = req.body;

    newProduct.sellerId = req.loggedInUserId;

    // save product
    await Product.create(newProduct);

    // send res
    return res.status(201).send({ message: "Product is added successfully." });
  }
);
export default router;
