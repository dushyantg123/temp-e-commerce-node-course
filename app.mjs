import "express-async-errors"; //this needs to be placed before any middleware code and it automatically catches the errors in try/catch handlers
import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./db/connect.mjs";
import cookieParser from "cookie-parser";
import notFoundMiddleware from "./middleware/not-found.mjs";
import ErrorHandlerMiddleware from "./middleware/error-handler.mjs";
import authRouter from "./routes/authRoutes.mjs";
import userRouter from "./routes/userRoutes.mjs";
import productRouter from "./routes/productRoutes.mjs";
import reviewRouter from "./routes/reviewRoutes.mjs";
import orderRouter from "./routes/orderRoutes.mjs";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import rateLimiter from "express-rate-limit"; //limit number of requests from a http address
import helmet from "helmet"; //set security related http response headers
import xss from "xss-clean"; //sanitize user input
import cors from "cors"; //allow access cross domain
import expressMongoSanitize from "express-mongo-sanitize"; //prevent mongodb injection.

//because in our controllers, we'll use try and catch
// because we'll have some asynchronous operations. And instead of adding this try-catch
// for all our controllers, once we use this package, it is gonna be applied to all our controllers automatically.
console.log("E-Commerce API");
const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, //limit each IP to 100requests per windowMs
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(expressMongoSanitize());
//app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use(notFoundMiddleware);
/* Why? Well because this one, the error handler one is invoked in the actual existing route.
So there's no way for you to get to this error handler one unless you actually hit the existing route.
If there is no route, it's just gonna check all the routes and it's gonna say all right,
so here it is, here it is, 404. Now this one on purpose per express rules
is set as a last one, because this one we only hit from the existing route,
so you won't hit it from the random route and just get the error.
That's now how it works. Only if in one of the existing routes you throw an error like we do
with our custom ones, only then it's gonna be handled over here.
*/
app.use(ErrorHandlerMiddleware);
const start = async () => {
  const port = process.env.PORT || 5000;
  const connect = await connectDB(process.env.MONGO_URL);
  app.listen(port, console.log(`Listening on port ${port}`));
};

start();
