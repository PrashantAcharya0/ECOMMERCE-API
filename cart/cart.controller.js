import express from "express";
import { isBuyer } from "../middleware/authentication.middleware.js";
import validateReqBody from "../middleware/validate.req.body.js";
import { addCartItemValidationSchema } from "./cart.validation.js";
import checkMongoIdsEquality from "../utlis/mongo.id.equality.js";
import Product from "../product/product.model.js";
import Cart from "../cart/cart.model.js";
import checkMongoIdsValidity from "../utlis/mongo.id.validity.js";
import validateMongoIdFromParam from "../middleware/validate.mongo.id.js";

const router = express.Router();

// * add item to cart
router.post(
  "/cart/add/item",
  isBuyer,
  validateReqBody(addCartItemValidationSchema),
  (req, res, next) => {
    // validate product id from req.body
    const { productId } = req.body;

    // check mongo id validity for product
    const isValidId = checkMongoIdsValidity(productId);

    // if not valid mongo id, throw error
    if (!isValidId) {
      return res.status(400).send({ message: "Invaild mongo id." });
    }

    //call next

    next();
  },
  async (req, res) => {
    // extract cart item data from req.body
    const { productId, orderedQuantity } = req.body;

    // find product using productId
    const product = await Product.findOne({ _id: productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: "Product doesnot exists." });
    }

    // check if ordered quantity does not excess product quantity
    if (orderedQuantity > product.quantity) {
      return res.status(403).send({ message: "product is outnumber." });
    }

    // add item to cart
    await Cart.create({
      buyerId: req.loggedInUserId,
      productId,
      orderedQuantity,
    });

    // send res
    return res.status(200).send({ message: "item is added to the cart" });
  }
);

// * flush cart / remove all items from the cart
router.delete("/cart/flush", isBuyer, async (req, res) => {
  // extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  // remove all items from cart for that buyer
  await Cart.deleteMany({ buyerId: buyerId }); // ! or in { buyerId } only

  // send res
  return res.status(200).send({ message: "Cart is cleared successfully!" });
});

// * remove single item from cart
router.delete(
  "/cart/item/delete/:id",
  isBuyer,
  validateMongoIdFromParam,
  async (req, res) => {
    // extract cartId from req.params
    const cartId = req.params.id;

    // check cart ownership
    const cart = await Cart.findOne({
      _id: cartId,
      buyerId: req.loggedInUserId,
    });

    // if not cart, throw error
    if (!cart) {
      return res
        .status(403)
        .send({ message: "You are not owner of this cart." });
    }

    //delete cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });

    // send res
    return res
      .status(200)
      .send({ message: "Cart item is removes sucessfully." });
  }
);

export default router;
