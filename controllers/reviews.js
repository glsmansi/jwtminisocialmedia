const Post = require("../models/Post");
const Review = require("../models/Review");

module.exports.createReview = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const review = new Review(req.body.review);
  console.log(req.body.review);
  review.author = req.userData.user_id;
  post.reviews.push(review);
  await review.save();
  await post.save();

  res.redirect(`/posts/${post._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Post.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/posts/${id}`);
};
