import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/couldinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { response } from "express";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response
  const { firstname, lastname, username, email, password } = req.body;
  console.log("Email: ", email);

  if (
    [firstname, lastname, username, email, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  // const avatar = await uploadOnCloudinary(avatarLocalPath);

  const user = await User.create({
    username: username.toLowerCase(),
    firstname: firstname.toLowerCase(),
    lastname: lastname.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regstering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  const { username, email, password } = req.body;

  //username or email
  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required...");
  }

  //find the user
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not Exist!!!");
  }

  //check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials!!!");
  }

  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("access_token", accessToken, option)
    .cookie("refresh_token", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //req body -> data
  //find user
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new ApiResponse(200, {}, "user Logged Out"));
  //
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //get refresh token cookies/body
  //check if the refresh token is available or not
  //verify jwt token
  //get user info from _id

  const incomingRefreshToken =
    (await req.cookies.refresh_token) || req.body.refresh_token;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request!!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!!");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("access_token", accessToken, options)
      .cookie("refresh_token", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access Token Refreshed!!"
        )
      );
  } catch (error) {
    console.log("Error: ", error);
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUserCart = await user.addToCart(productId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUserCart, "Product added to cart"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }
  const updatedCartItems = await user.removeFromCart(productId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCartItems, "Product removed from cart"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  addToCart,
  removeFromCart,
};
