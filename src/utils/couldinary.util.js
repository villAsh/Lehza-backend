import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_COULD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("Upload Successfully: ", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("ERROR: ", error);
    //remove locally saved temp file as the upload opration got failed
    fs.unlink(localFilePath);
  }
};

export { uploadOnCloudinary };
