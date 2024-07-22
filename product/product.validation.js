import Yup from "yup";
import { productCategories } from "../constant/general.constant.js";

export const addProductValidationSchema = Yup.object({
  name: Yup.string().required().trim().max(55),
  brand: Yup.string().required().trim().max(55),
  price: Yup.number().required().moreThan(0),
  quantity: Yup.number().required().min(1),
  category: Yup.string().trim().required().oneOf(productCategories),
  freeShipping: Yup.boolean().default(false),
  description: Yup.string().required().trim().min(10).max(1000),
});
