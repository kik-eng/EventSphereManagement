
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const mainRoute = require("./src/route/mainRoute");
const dbConnection = require("./src/config/dbConnection");

const port = 3000;

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(cors());

// ================= UPLOADS =================

// Images and documents will open from:
// http://localhost:3000/uploads/filename.jpg

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================= DATABASE =================

dbConnection.dbConnection();

// ================= API ROUTES =================

app.use("/api", mainRoute);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.json({
    message: "Backend is working successfully",
    uploads: "http://localhost:3000/uploads/"
  });
});

// ================= SERVER =================

app.listen(port, () => {
  console.log("--------------------------------");
  console.log("EventSphere Backend Started");
  console.log(`Server: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);
  console.log(`Uploads: http://localhost:${port}/uploads`);
  console.log("--------------------------------");
});
