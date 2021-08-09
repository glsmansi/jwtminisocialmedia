const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
const path = require("path");
const { auth } = require("./middleware");

// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError");
// const session = require("express-session");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user");
const postsRoutes = require("./routes/posts");
const reviewRoutes = require("./routes/review");

const app = express();

// app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "./public")));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/authapp", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb connected"))
  .catch((e) => console.log(e));

app.use("/posts", postsRoutes);
app.use("/posts/:id/reviews", reviewRoutes);
app.use("/", userRouter);

app.get("/", auth, async (req, res) => {
  const currentUser = req.userData;
  // console.log(currentUser);
  res.render("home", { currentUser });
});

app.get("/home", (req, res) => {
  const currentUser = req.userData;
  res.render("home", { currentUser });
});

// app.all("*", (req, res, next) => {
//   next(new ExpressError("Page Not Found", 404));
// });

// app.use((err, req, res, next) => {
//   const { statusCode = 400 } = err;
//   if (err.message == "") err.message = "Something went wrong";
//   res.status(statusCode).send(err);
// });

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
