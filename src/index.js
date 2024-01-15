// require("dotenv").config({path: "./env"});
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((error) => console.error("MONGODB connection failed...", error));

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
