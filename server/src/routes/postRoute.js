const express = require("express");
const router = express.Router();


const {
  createPost,
  getPostsOfFollowedUsers,
  toggleLikeUnlikePost,
  getPostAndPopulateComment,
  getPostById,
  getAllPosts,
  getSpecificUsersAllPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// createPost route
router.post("/posts/createPost", createPost);

// getPosts of followedUsers route
router.get("/posts/:userId/following", getPostsOfFollowedUsers);

// toggleLikeUnlikePost
router.put("/posts/:postId/like", toggleLikeUnlikePost);

// getPostAndPopulateComment route;
router.get("posts/:postId/comments", getPostAndPopulateComment);

// getPostById route
router.get("/:userId/posts/:postId/getPostById", getPostById);

// getAllPosts routes
router.get("/users/:userId", getAllPosts);

router.get("/users/post/:userId", getSpecificUsersAllPost);

// update a post route
router.put("/posts/:postId", updatePost);

// deleteAPost route
router.delete("/posts/:postId", deletePost);

module.exports = router;
