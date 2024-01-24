import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

//Routes import
import UserRouter from "./routes/user.routes.js";
import ProductRouter from "./routes/product.routes.js";

//Routes decalration
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/products", ProductRouter);
export { app };
