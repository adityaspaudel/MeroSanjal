const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
// MONGODB_ATLAS_URI =
// 	"mongodb+srv://adityaspaudel_db_user:adityaspaudel_db_user@cluster0.3uk6ln2.mongodb.net/?appName=Cluster0";

MONGODB_COMPASS_URI = "mongodb://localhost:27017/merosanjal";
// ------------------ Database ------------------
const dbConnect = async () => {
	try {
		const isConnected = await mongoose.connect(
			process.env.MONGODB_ATLAS_URI || MONGODB_COMPASS_URI
		);
		if (!isConnected) {
			console.error(`could not connect to mongodb`);
		} else {
			console.log("connected to mongodb");
		}
	} catch (err) {
		console.error("❌ Error connecting to MongoDB", err);
	}
};

module.exports = dbConnect;
