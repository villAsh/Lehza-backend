import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
      required: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.method.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this_id,
      email: this.email,
      username: this.username,
      firstname: this.firstname,
      lastname: this.lastname,
    },
    process.env.ACCESS_TOKENS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKENS_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this_id,
      email: this.email,
      username: this.username,
      firstname: this.firstname,
      lastname: this.lastname,
    },
    process.env.REFRESH_TOKENS_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKENS_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
