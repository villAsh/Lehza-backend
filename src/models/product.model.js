import mongoose, { Schema } from "mongoose";

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
    },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Product", productSchema);
