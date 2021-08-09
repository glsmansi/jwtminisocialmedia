const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { auth, isAuthor } = require("../middleware");
const multer = require("multer");

var upload = multer({ dest: "uploads/" });

const posts = require("../controllers/posts");

router
  .route("/")
  .get(auth, catchAsync(posts.index))
  .post(auth, upload.single("image"), catchAsync(posts.createPost));

router.get("/new", auth, posts.new);

router
  .route("/:id")
  .get(auth, catchAsync(posts.show))
  .put(auth, isAuthor, upload.single("image"), catchAsync(posts.updatePost))
  .delete(auth, isAuthor, catchAsync(posts.deletePost));

router.route("/new").get(auth, catchAsync(posts.new));

module.exports = router;
