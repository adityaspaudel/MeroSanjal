const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("./db/connection");
const path = require("path");

// Routes
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const notificationRoute = require("./routes/notificationRoute");

// Import controller to inject socket instance
const { setSocketInstance } = require("./controllers/notificationController");

dotenv.config();

// ------------------ APP SETUP ------------------
const app = express();
const server = http.createServer(app);

// ✅ middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ DATABASE ------------------
dbConnect();

// ------------------ SOCKET.IO SETUP ------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ My Next.js frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Pass socket.io instance to controllers
setSocketInstance(io);

// Handle socket connection
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  //  Join personal room using userId
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ------------------ ROUTES ------------------
app.use(userRoute);
app.use(postRoute);
app.use(commentRoute);
app.use(notificationRoute);

// ------------------ SERVER LISTEN ------------------
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
