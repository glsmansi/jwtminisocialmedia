const Post = require("./models/Post");
const Review = require("./models/Review");
const jwt = require("jsonwebtoken");

module.exports.auth = (req, res, next) => {
  const token = req.cookies.cookietokenkey;

  if (!token) {
    return res.redirect("/login");
    // return console.log("error");
  }
  try {
    // console.log(token, process.env.TOKEN_KEY);
    const data = jwt.verify(token, process.env.TOKEN_KEY);
    req.userData = data;

    // console.log(token);
    return next();
  } catch (e) {
    console.log(e);
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.userData.user_id)) {
    // req.flash("error", "You donot have access to do that");
    return res.redirect(`/posts/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post.author.equals(req.userData.user_id)) {
    return res.redirect(`/posts/${id}`);
  }
  next();
};
