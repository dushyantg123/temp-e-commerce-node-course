import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  uploadImage,
} from "../controllers/productController.mjs";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication.mjs";
const router = express.Router();
router
  .route("/")
  .post(authenticateUser, authorizePermissions("admin"), createProduct)
  .get(getAllProducts);
router
  .route("/:id")
  .patch(authenticateUser, authorizePermissions("admin"), updateProduct)
  .delete(authenticateUser, authorizePermissions("admin"), deleteProduct)
  .get(getSingleProduct);
router
  .route("/uploadImage")
  .post(authenticateUser, authorizePermissions("admin"), uploadImage);
export default router;
