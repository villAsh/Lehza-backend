import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      (await req.cookies?.access_token) ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request!!!");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKENS_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password",
      "-refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token!!!");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token!!!");
  }
});
