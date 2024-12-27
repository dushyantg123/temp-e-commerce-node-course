import { StatusCodes } from "http-status-codes";
import Product from "../models/Product.mjs";
import Review from "../models/Review.mjs";
import * as customError from "../errors/index.mjs";
import checkPermissions from "../utils/checkPermissions.mjs";
const createReview = async (req, resp) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct)
    throw new customError.NotFoundError(
      "Cannot review a product that cannot be reviewed"
    );
  req.body.user = req.user.userId;
  const isAlreadySubmittedReview = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  console.log(`isAlreadySubmitted:${isAlreadySubmittedReview}`);
  if (isAlreadySubmittedReview)
    throw new customError.BadRequestError(
      "Already submitted review for this product"
    );
  const review = await Review.create(req.body);

  resp.status(StatusCodes.CREATED).json({ review });
};
const getAllReviewsDetailsByProductAndUser = async (req, resp) => {
  const reviews = await Review.find({})
    .populate({ path: "product", select: "name company price" })
    .populate({ path: "user", select: "name" });
  resp.status(StatusCodes.OK).json({ reviews, total: reviews.length });
};
const getAllReviews = async (req, resp) => {
  const reviews = await Review.find({});
  resp.status(StatusCodes.OK).json({ reviews, total: reviews.length });
};
const getSingleReview = async (req, resp) => {
  const review = await Review.find({ _id: req.params.id });
  if (!review)
    throw new customError.NotFoundError(
      `did not find the review with id=${req.params.id}`
    );
  resp.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, resp) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new customError.NotFoundError(
      `unable to find the review with id=${reviewId} to update.`
    );
  checkPermissions(req.user, review.user);
  const { comment, rating, title } = req.body;
  review.comment = comment;
  review.rating = rating;
  review.title = title;
  await review.save();

  resp.status(StatusCodes.OK).json({ msg: "updated review", review });
};
const deleteReview = async (req, resp) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new customError.NotFoundError(
      `unable to find the review with id=${reviewId} to delete.`
    );
  checkPermissions(req.user, review.user);

  await review.remove();
  resp.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  deleteReview,
  updateReview,
  getAllReviewsDetailsByProductAndUser,
};
