

const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();

const mainRoute = require("./src/route/mainRoute");
const dbConnection = require("./src/config/dbConnection");

const port = process.env.PORT || 3000;

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(cors());

// ================= UPLOADS =================

// Serverless platform (Vercel) check: /tmp dir read-write permission hold karti hai
const uploadDir = process.env.VERCEL 
  ? "/tmp" 
  : path.join(__dirname, "uploads");

app.use("/uploads", express.static(uploadDir));

// ================= DATABASE =================

dbConnection.dbConnection();

// ================= API ROUTES =================

app.use("/api", mainRoute);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const baseUrl = `${protocol}://${req.get("host")}`;
  res.json({
    message: "Backend is working successfully",
    uploads: `${baseUrl}/uploads/`
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



module.exports = app;