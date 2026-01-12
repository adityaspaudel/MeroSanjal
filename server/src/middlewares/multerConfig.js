// multer only

// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// // Define storage engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../uploads/posts"); // ✅ Fixed from "rooms" → "posts"
//     fs.mkdirSync(uploadPath, { recursive: true });
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(
//       null,
//       `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
//     );
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;

// // cloudinary

const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
