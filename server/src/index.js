const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("./db/connection");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

// Routes
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const notificationRoute = require("./routes/notificationRoute");
const messageRoute = require("./routes/messageRoute");

// Controllers
const { setMessageSocket } = require("./controllers/messageController");
const { setSocketInstance } = require("./controllers/notificationController");

dotenv.config();

// ------------------ APP SETUP ------------------
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(morgan("dev")); // Logging middleware
app.use(helmet()); // Security middleware
app.use(compression()); // GZIP compression
app.use(cookieParser()); // Parse cookies

// Database
dbConnect();

// ------------------ SOCKET.IO SETUP ------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Inject socket instance to controllers
setMessageSocket(io);
setSocketInstance(io);

// 🔥 socket.on("connection")
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ------------------ ROUTES ------------------
app.use(userRoute);
app.use(postRoute);
app.use(commentRoute);
app.use(notificationRoute);
app.use(messageRoute);

// ------------------ SERVER LISTEN ------------------
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
