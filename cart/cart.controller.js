import express from 'express';
import { isBuyer } from '../middleware/authentication.middleware.js';
import validateReqBody from '../middleware/validate.req.body.js';
import checkMongoIdsValidity from '../utlis/mongo.id.validity.js';
import { addCartItemValidationSchema } from './cart.validation.js';
import Product from '../product/product.model.js';
import Cart from '../cart/cart.model.js';
import validateMongoIdFromParam from '../middleware/validate.mongo.id.js';
import { paginationDateValidationSchema } from '../product/product.validation.js';

const router = express.Router();

// * add item to cart
router.post(
  '/cart/add/item',
  isBuyer,
  validateReqBody(addCartItemValidationSchema),
  (req, res, next) => {
    // validate product id from req.body
    const { productId } = req.body;

    // check mongo id validity for productId
    const isValidId = checkMongoIdsValidity(productId);

    // if not valid mongo id, throw error
    if (!isValidId) {
      return res.status(400).send({ message: 'Invalid mongo id.' });
    }

    // call next function
    next();
  },
  async (req, res) => {
    // extract cart item data from req.body
    const { productId, orderedQuantity } = req.body;

    // find product using productId
    const product = await Product.findOne({ _id: productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: 'Product does not exist.' });
    }

    const cart = await Cart.findOne({ productId, buyerId: req.loggedInUserId });

    if (cart) {
      return res
        .status(409)
        .send({ message: 'Item has been already added to cart.' });
    }

    // check if ordered quantity exceeds product quantity
    if (orderedQuantity > product.quantity) {
      return res
        .status(403)
        .send({ message: 'Ordered quantity is more than product quantity.' });
    }

    // add item to cart
    await Cart.create({
      buyerId: req.loggedInUserId,
      productId,
      orderedQuantity,
    });

    // send res
    return res
      .status(201)
      .send({ message: 'Item is added to cart successfully.' });
  }
);

// * flush cart / remove all items from cart
router.delete('/cart/flush', isBuyer, async (req, res) => {
  // extract buyerId from req.loggedInUserId
  const buyerId = req.loggedInUserId;

  // remove all items from cart for that buyer
  await Cart.deleteMany({ buyerId });

  // send res
  return res.status(200).send({ message: 'Cart is cleared successfully.' });
});

// * remove single item from cart
//  id => cartId
router.delete(
  '/cart/item/delete/:id',
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
        .send({ message: 'You are not owner of this cart.' });
    }

    // delete cart
    await Cart.deleteOne({ _id: cartId, buyerId: req.loggedInUserId });

    // send res
    return res
      .status(200)
      .send({ message: 'Cart item is removed successfully.' });
  }
);

// ? list cart item
router.post(
  '/cart/list',
  isBuyer,
  validateReqBody(paginationDateValidationSchema),
  async (req, res) => {
    const { page, limit } = req.body;

    const skip = (page - 1) * limit;

    const data = await Cart.aggregate([
      {
        $match: {
          buyerId: req.loggedInUserId,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productData',
        },
      },

      {
        $facet: {
          calculateAmount: [
            {
              $project: {
                productId: 1,
                itemTotal: {
                  $multiply: [
                    '$orderedQuantity',
                    { $first: '$productData.price' },
                  ],
                },
                orderedQuantity: 1,
                price: { $first: '$productData.price' },
              },
            },
            {
              $group: {
                _id: null,
                subTotal: { $sum: '$itemTotal' },
              },
            },
          ],
          itemsInCart: [
            {
              $project: {
                productId: 1,
                orderedQuantity: 1,
                productDetails: {
                  name: { $first: ['$productData.name'] },
                  brand: { $first: '$productData.brand' },
                  category: { $first: '$productData.category' },
                  totalQuantity: { $first: '$productData.quantity' },
                  image: { $first: '$productData.image' },
                  freeShipping: { $first: '$productData.freeShipping' },
                  price: { $first: '$productData.price' },
                },
              },
            },
          ],
        },
      },
    ]);

    const cartItems = data[0]?.itemsInCart;
    const subTotal = data[0]?.calculateAmount[0]?.subTotal;
    // ? one way of doing it
    // const subTotal = data.reduce((accumulator, item) => {
    //   return (accumulator += item.productDetails.price * item.orderedQuantity);
    // }, 0);

    // console.log(subTotal);

    return res
      .status(200)
      .send({ message: 'success', cartData: cartItems, subTotal });
  }
);

router.get('/cart/item/count', isBuyer, async (req, res) => {
  const cartItemCount = await Cart.find({
    buyerId: req.loggedInUserId,
  }).countDocuments();

  return res.status(200).send({ itemCount: cartItemCount });
});

export default router;
