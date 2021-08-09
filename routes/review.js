const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");

const { auth, isReviewAuthor } = require("../middleware");

router.post("/", auth, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  auth,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
