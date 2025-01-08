import express from 'express';
import {
  isBuyer,
  isSeller,
  isUser,
} from '../middleware/authentication.middleware.js';
import Product from './product.model.js';
import validateReqBody from '../middleware/validate.req.body.js';
import {
  addProductValidationSchema,
  paginationDateValidationSchema,
} from './product.validation.js';
import validateMongoIdFromParam from '../middleware/validate.mongo.id.js';
import checkMongoIdsEquality from '../utlis/mongo.id.equality.js';

const router = express.Router();

// * add product
router.post(
  '/product/add',
  isSeller,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract newProduct from req.body
    const newProduct = req.body;

    // add seller Id
    newProduct.sellerId = req.loggedInUserId;
    console.log(newProduct);

    // add/save product
    await Product.create(newProduct);

    // send res
    return res.status(201).send('Adding product...');
  }
);

// * list all products
router.get('/product/list', isUser, async (req, res) => {
  // find all products
  const products = await Product.find();

  // send res
  return res.status(200).send({ message: 'success', productList: products });
});

// * delete product
router.delete(
  '/product/delete/:id',
  isSeller,
  validateMongoIdFromParam,
  async (req, res) => {
    // extract product id from req.params
    const productId = req.params.id;

    // find product using productId
    const product = await Product.findById(productId);

    // if not product found, throw error
    if (!product) {
      return res.status(404).send({ message: 'Product does not exist.' });
    }
    // check if loggedInUserId id owner of the product
    const isProductOwner = product.sellerId.equals(req.loggedInUserId);

    // console.log(isProductOwner);
    // if not owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: 'you are not owner of this product.' });
    }

    // delete product
    await Product.findByIdAndDelete(productId);

    // send res
    res.status(200).send({ message: 'Product is deleted sucessfully.' });
  }
);

// * edit product
router.put(
  '/product/edit/:id',
  isSeller,
  validateMongoIdFromParam,
  validateReqBody(addProductValidationSchema),
  async (req, res) => {
    // extract productId from req.paramd
    const productId = req.params.id;

    // find product using product id
    const product = await Product.findOne({ _id: productId });

    // if not product, throw error
    if (!product) {
      return res.status(404).send({ message: 'Product does not exist.' });
    }

    // check product ownership
    const isProductOwner = checkMongoIdsEquality(
      product.sellerId,
      req.loggedInUserId
    );

    // if not product owner, throw error
    if (!isProductOwner) {
      return res
        .status(403)
        .send({ message: 'you are not owner of this product.' });
    }

    // extract new values from req.body
    const newValues = req.body;

    // edit product
    await Product.updateOne(
      {
        _id: productId,
      },
      {
        $set: { ...newValues },
      }
    );
    // or
    // await Product.findByIdAndDelete(productId, newValues);

    // send res
    return res.status(200).send('Editing...');
  }
);

// * get product details
router.get(
  '/product/detail/:id',
  isUser,
  validateMongoIdFromParam,
  async (req, res) => {
    //extract product from req.params
    const productId = req.params.id;

    console.log(productId);

    // find product using product id
    const product = await Product.findOne({ _id: productId });
    console.log(product);

    // if not product , throw error
    if (!product) {
      return res.status(400).send({ message: 'Product does not exist.' });
    }

    //send res
    return res
      .status(200)
      .send({ message: 'Product details...', productDetail: product });
  }
);

// * list product by seller
router.post(
  '/product/seller/list',
  isSeller,
  validateReqBody(paginationDateValidationSchema),
  async (req, res) => {
    //extract pagintion data  from req.params
    const { page, limit, searchText } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    // condition
    let match = { sellerId: req.loggedInUserId };

    if (searchText) {
      match.name = { $regex: searchText, $option: 'i' };
    }

    const products = await Product.aggregate([
      {
        $match: match,
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: 1,
        },
      },
    ]);

    return res
      .status(200)
      .send({ message: 'seller list...', productList: products });
  }
);

// * list product by buyer
router.post(
  '/product/buyer/list',
  isBuyer,
  validateReqBody(paginationDateValidationSchema),
  async (req, res) => {
    //extract pagintion data  from req.params
    const { page, limit, searchText } = req.body;

    let match = {};

    if (searchText) {
      match.name = { $regex: searchText, $option: 'i' };
    }

    // calculate skip
    const skip = (page - 1) * limit;

    // find product
    const products = await Product.aggregate([
      {
        $match: match,
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          brand: 1,
          image: 1,
          description: 1,
        },
      },
    ]);

    return res
      .status(200)
      .send({ message: 'buyer list...', productList: products });
  }
);
export default router;
