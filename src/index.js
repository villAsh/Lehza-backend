// require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import express from "express";
import connectDB from "./db/index.js";
const app = express();

dotenv.config({
  path: "./env",
});
connectDB();


/* APPROACH 1
 (async () => {
   try {
     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
     app.on("error", (error) => {
       console.log("ERROR: ", error);
       throw error;
     });

     app.listen(process.env.PORT, () => {
       console.log(`App is listing on Port ${process.env.PORT} `);
     });

   } catch (err) {
     console.error("ERROR : ", err);
     throw err;
   }
 })();

*/
