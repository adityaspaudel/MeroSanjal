const Post = require("../models/postModel");
const { createNotification } = require("./notificationController");
const User = require("../models/userModel");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const createPost = async (req, res) => {
	try {
		const { author, content } = req.body;

		if (!author || !content) {
			return res.status(400).json({ message: "All fields required" });
		}

		let imageUrls = [];

		// ✅ Cloudinary upload
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				const uploadResult = await cloudinary.uploader.upload(
					`data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
					{ folder: "posts" }
				);
				// store only the cloudinary url (no server prefix ever)

				imageUrls.push(uploadResult.secure_url);
			}
		}

		console.log("✅ Stored Cloudinary URLs:", imageUrls);

		const post = await Post.create({
			author,
			content,
			imagesUrl: imageUrls, // cloudinary urls
		});

		res.status(201).json({
			message: "✅ Post created successfully",
			post,
		});
	} catch (err) {
		console.error("❌ Error creating post:", err);
		res.status(500).json({ message: "Error creating post" });
	}
};

//  getPosts of followed User controller

const getPostsOfFollowedUsers = async (req, res) => {
	try {
		const { userId } = req.params; // logged-in user ID

		// 🧩 Find the logged-in user and their following list
		const user = await User.findById(userId).select("following");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// 🧠 Include self + followed users
		const followingIds = [...user.following, user._id];

		// 📰 Fetch posts with author, comments, and imagesUrl
		const posts = await Post.find({ author: { $in: followingIds } })
			.populate("author", "fullName email username profilePic")
			.populate("comments.user", "fullName email username profilePic")
			.sort({ createdAt: -1 })
			.lean(); // converts Mongoose docs to plain JS objects

		// 🖼️ Ensure image URLs are properly prefixed if you’re serving them statically
		const formattedPosts = posts.map((post) => ({
			...post,
			imagesUrl: post.imagesUrl?.map(
				(img) => `${req.protocol}://${req.get("host")}/${img}`
			),
		}));

		res.status(200).json({
			message: "✅ Posts fetched successfully",
			count: formattedPosts.length,
			posts: formattedPosts,
		});
	} catch (err) {
		console.error("❌ Error fetching followed posts:", err);
		res.status(500).json({ message: "Error fetching followed posts" });
	}
};

// Toggle like/unlike for a post controller
const toggleLikeUnlikePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { userId } = req.body;
		if (!userId) return res.status(400).json({ message: "User ID required" });

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ message: "Post not found" });

		const isLiked = post.likes.some((id) => id.toString() === userId);
		if (isLiked) {
			post.likes = post.likes.filter((id) => id.toString() !== userId);
		} else {
			post.likes.push(userId);

			// ✅ Create notification for like (skip if user likes own post)
			if (post.author.toString() !== userId) {
				await createNotification({
					recipient: post.author,
					sender: userId,
					type: "like",
					postId: post._id,
					message: "liked your post",
				});
			}
		}

		await post.save();
		res.status(200).json({
			message: isLiked ? "Post unliked" : "Post liked",
			likesCount: post.likes.length,
			liked: !isLiked,
		});
	} catch (error) {
		console.error("Error toggling like:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// get specific post and populate comments controller

const getPostAndPopulateComment = async (req, res) => {
	try {
		const { postId } = req.params;

		const post = await Post.findById(postId).populate(
			"comments.user",
			"fullName email"
		); // populate user info in comments

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		res.status(200).json({
			success: true,
			comments: post.comments,
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching comments",
		});
	}
};

// getPostById controller
const getPostById = async (req, res) => {
	try {
		console.log("Params:", req.params); // ✅ Debug
		const { userId, postId } = req.params;

		const post = await Post.findById(postId)
			.populate("author", "fullName")
			.populate({
				path: "comments",
				populate: { path: "user", select: "fullName" },
			});

		if (!post) return res.status(404).json({ error: "Post not found" });

		res.json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getAllPosts = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: "Error fetching user" });
	}
};

// get specific user's all post controller
const getSpecificUsersAllPost = async (req, res) => {
	try {
		const { userId } = req.params;

		const posts = await Post.find({ author: userId })
			.populate("author", "fullName email")
			.populate({
				path: "comments",
				populate: { path: "user", select: "fullName email" },
			})
			.sort({ createdAt: -1 });

		res.json(posts);
	} catch (error) {
		console.error("Error fetching posts:", error);
		res.status(500).json({ message: "Server error" });
	}
};

const updatePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { content, userId } = req.body;

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ message: "Post not found" });

		post.content = content || post.content;
		await post.save();

		// ✅ Optional notification if updater is not author
		if (userId && post.author.toString() !== userId) {
			await createNotification({
				recipient: post.author,
				sender: userId,
				type: "comment", // use existing enum to avoid schema issues
				postId: post._id,
				message: "updated your post",
			});
		}

		res.status(200).json({ message: "Post updated", post });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// delete a post controller
const deletePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const post = await Post.findByIdAndDelete(postId);
		if (!post) return res.status(404).json({ message: "Post not found" });

		res.status(200).json({ message: "Post deleted" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	createPost,
	getPostsOfFollowedUsers,
	toggleLikeUnlikePost,
	getPostAndPopulateComment,
	getPostById,
	getAllPosts,
	getSpecificUsersAllPost,
	updatePost,
	deletePost,
};
