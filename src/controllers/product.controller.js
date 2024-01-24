import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  console.log("products", products);

  if (!products) {
    throw new ApiError(404, "Products not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully!!!"));
});

const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(401, "ProductId is not valid!!!");
  }
  console.log("productId", productId);

  try {
    const product = await Product.findById(productId);
    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  } catch (error) {
    throw new ApiError(401, "ProductId is not valid!!!");
  }
});

const postReview = asyncHandler(async (req, res) => {
  //req.body -> userId, productId, comment
  //validate
  //save
  const { review, ratings } = req.body;
  const { productId } = req.params;
  const user = req.user;

  if (!review || !ratings) {
    throw new ApiError(401, "Please Enter Review or ratings!!");
  }
  if (!productId) {
    throw new ApiError(404, "Product id is required!!");
  }
  try {
    const product = await Product.findById(productId);
    const savedProduct = await product.postReview(
      productId,
      review,
      ratings,
      user
    );
    // console.log("saved Product",savedProduct);
    return res
      .status(200)
      .json(
        new ApiResponse(200, savedProduct, "Review Posted Successfully!!!")
      );
  } catch (error) {
    throw new ApiError(404, error?.message || "Product not found!!!");
  }
});

export { getAllProducts, getProductDetails, postReview };
