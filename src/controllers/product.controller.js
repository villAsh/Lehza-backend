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
  const { productId } = req.body;
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


export { getAllProducts, getProductDetails };
