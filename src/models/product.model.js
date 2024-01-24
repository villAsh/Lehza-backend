import mongoose, { Schema } from "mongoose";
import { ApiError } from "../utils/ApiError.util.js";

const reviewSchema = new Schema(
  {
    ratings: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      username: {
        type: mongoose.Schema.Types.String,
        ref: "User.username",
        required: true,
      },
      profile: {
        type: mongoose.Schema.Types.String,
        ref: "User.avatar",
        required: false,
      },
    },
  },
  { timestamps: true }
);

const productSchema = new Schema(
  {
    productImage: {
      type: String, //cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    ratings: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const calculateRating = (reviews) => {
  let totalRatings = 0;
  reviews.forEach((review) => {
    totalRatings += review.ratings;
  });
  return totalRatings / reviews.length;
};
productSchema.methods.postReview = async function (
  productId,
  review,
  ratings,
  user
) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found!!!");
  }

  product.reviews.push({
    ratings: ratings,
    review: review,
    user: {
      username: user.username,
      profile: user.avatar,
    },
  });

  const avgRating = calculateRating(product.reviews);
  product.ratings = avgRating;
  console.log("average ratings...",avgRating);
  const savedProduct = product.save();
  console.log("saved product...",savedProduct);
  return savedProduct;
};

export const Product = mongoose.model("Product", productSchema);
