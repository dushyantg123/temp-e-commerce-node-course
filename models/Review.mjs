import mongoose from "mongoose";
import user from "./User.mjs";
import product from "./Product.mjs";

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      required: [true, "please provide title"],
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "please provide comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); //create a compound index to allow one review per product for a user

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  console.log(productId);
  const result = this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: productId,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      {
        _id: productId,
      },
      {
        averageRating: Math.ceil(result[0]?.averageRating) || 0,
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (err) {
    console.log(
      "error thrown in updating average rating and number of reviews for the product in the Review model"
    );
  }
};
// you cannot use async anonymous () => operator here since you cannot  note that arrow functions
//do not bind their own this, which could cause issues if this is needed (as in your example).
//To keep the context of this in such cases, you need to use the traditional function syntax or explicitly bind this.
ReviewSchema.post("save", async function () {
  console.log("post save hook called");
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {
  console.log("post remove hook called");
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

export default mongoose.model("Review", ReviewSchema);
