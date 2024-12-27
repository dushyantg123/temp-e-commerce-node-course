import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication.mjs";
import {
  createReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
  updateReview,
  getAllReviewsDetailsByProductAndUser,
} from "../controllers/reviewController.mjs";
import express from "express";
const router = express.Router();
router.route("/").post(authenticateUser, createReview);
router.route("/").get(getAllReviews);
router.route("/details").get(getAllReviewsDetailsByProductAndUser);
router.route("/:id").get(getSingleReview);
router.route("/:id").delete(authenticateUser, deleteReview);
router.route("/:id").patch(authenticateUser, updateReview);
export default router;
