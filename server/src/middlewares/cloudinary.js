const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dg69wztkk",
	api_key: process.env.CLOUDINARY_API_KEY || "876996177579712",
	api_secret:
		process.env.CLOUDINARY_API_SECRET || "eZuG5bJHjsGtM80nY07KTGHfhvc",
});

module.exports = cloudinary;
