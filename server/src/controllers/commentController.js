const { Comment } = require("../models/commentModel");
const Post = require("../models/postModel"); // ✅ Needed

const mongoose = require("mongoose");
// Add comment controller (only if follower)

const {createNotification} = require("./notificationController");

const addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    // ✅ Populate last comment
    const populatedComment = await Post.findById(req.params.id)
      .populate("comments.user", "fullName")
      .select("comments")
      .then((p) => p.comments[p.comments.length - 1]);

    // ✅ Create notification for comment (skip if user comments own post)
    if (post.author.toString() !== userId) {
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "comment",
        postId: post._id,
        message: "commented on your post",
      });
    }

    res
      .status(201)
      .json({ message: "Comment added", comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

// ---------------- Update Comment ----------------
// updateComment controller
const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId, text } = req.body;

    if (!text?.trim())
      return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId)
      return res
        .status(403)
        .json({ message: "You can only edit your own comment" });

    comment.text = text;
    await post.save();

    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error editing comment" });
  }
};

// ---------------- Delete Comment ----------------
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body; // to make sure body is used

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author can delete
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comment" });
    }

    // Remove comment safely
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res
      .status(500)
      .json({ message: "Server error deleting comment", error: error.message });
  }
};

module.exports = { addComment, updateComment, deleteComment };
