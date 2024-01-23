import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Product } from "./product.model.js";
import { ApiError } from "../utils/ApiError.util.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstname: {
      type: String,
      lowercase: true,
      trim: true,
    },
    lastname: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String, //cloudinary url
      // required: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      firstname: this.firstname,
      lastname: this.lastname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      firstname: this.firstname,
      lastname: this.lastname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.addToCart = async function (productId) {
  const product = await Product.findById({
    _id: productId,
  });
  console.log(product);
  console.log("product id...", productId);
  if (!product) {
    throw new ApiError(404, "Product not found!!!");
  }

  const cartProductIndex = this.cart.items.findIndex((cp) => {
    console.log("cp", cp.productId);
    return productId.toString() === cp.productId.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: productId,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  const user = await User.updateOne({ cart: this.cart });
  return user;
};

userSchema.methods.removeFromCart = async function (productId) {
  console.log("product id",productId);
  const cartProductIndex = this.cart.items.findIndex(
    (cp) => cp.productId.toString() === productId.toString()
  );
  console.log("cart product index....", cartProductIndex);
  if (cartProductIndex === -1) {
    throw new ApiError(404, "Product not found in the cart");
  }

  this.cart.items.splice(cartProductIndex, 1);

  await this.save();
};

export const User = mongoose.model("User", userSchema);
