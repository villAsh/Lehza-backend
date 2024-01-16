import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/couldinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

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

  const existingUser = User.findOne({
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
    firstname,
    lastname,
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

export { registerUser };
