import Yup from "yup";

export const userValidationSchema = Yup.object({
  email: Yup.string().email().required().trim().max(55).lowercase(),
  password: Yup.string().required().trim(),
  firstName: Yup.string().required().trim().max(30),
  lastName: Yup.string().required().trim().max(30),
  gender: Yup.string().required().trim().oneOf(["male", "female", "other"]),
  role: Yup.string().trim().required().oneOf(["buyer", "seller"]),
});

export const loginUserValidationSchema = Yup.object({
  email: Yup.string().email().required().trim().max(55).lowercase(),
  password: Yup.string().required().trim(),
  searchText: Yup.string().trim().notRequired(),
});
