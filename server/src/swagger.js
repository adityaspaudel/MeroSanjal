const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My Express API",
    description: "Auto-generated API documentation",
  },
  host: "localhost:8000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./routes/userRoute.js",
  "./routes/postRoute.js",
  "./routes/notificationRoute.js",
  "./routes/commentRoute.js",
  "./routes/messageRoute.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
