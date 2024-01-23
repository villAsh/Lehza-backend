import { Router } from "express";
import { addToCart, removeFromCart } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllProducts,
  getProductDetails,
} from "../controllers/product.controller.js";

const router = Router();

router.route("/get-products").get(getAllProducts);
router.route("/get-product-details").get(getProductDetails);
//secured routes
router.route("/add-to-cart").post(verifyJWT, addToCart);

router.route("/remove-from-cart").post(verifyJWT, removeFromCart);

export default router;
