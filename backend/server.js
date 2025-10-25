
// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

// -------------------- MIDDLEWARE --------------------
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

// ✅ IMPORTANT: Serve uploaded images as static files
// This must come before other routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// -------------------- MONGODB CONNECTION --------------------
const MONGO_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/sivajothi";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------- IMPORT ROUTERS --------------------
const farmerRouter = require("./routes/farmers");
const sellerRouter = require("./routes/sellers");
const deliverymanRouter = require("./routes/deliveryman");
const productRouter = require("./routes/products"); // ✅ This has farmerId support
const farmerProductRouter = require("./routes/farmerProducts");
const sellerOrderRouter = require("./routes/sellerOrders"); // ✅ This has farmerId support
const farmerOrderRouter = require("./routes/farmerOrders");
const deliveryPostRouter = require("./routes/deliveryposts");
const schemesRouter = require("./routes/schemes");
const userRouter = require("./routes/user");
const deliverymenRouter = require("./routes/DeliveryMen");
const authRouter = require("./routes/auth");
const deliverymenAuthRouter = require("./routes/deliverymenAuth");
const appliedSchemesRoutes = require("./routes/appliedSchemes");
const salaryRoutes = require('./routes/salary');
app.use('/salary', salaryRoutes);

// -------------------- REGISTER ROUTES --------------------
// ✅ Register routes in correct order (most specific first)

// Authentication routes
app.use("/auth", authRouter);
app.use("/deliverymenAuth", deliverymenAuthRouter);

// User routes
app.use("/farmer", farmerRouter);
app.use("/seller", sellerRouter);
app.use("/deliveryman", deliverymanRouter);
app.use("/user", userRouter);
app.use("/deliverymen", deliverymenRouter);

// ✅ Product routes - USE THE ROUTER, DON'T DEFINE ROUTES HERE
app.use("/product", productRouter); // This handles all /product/* routes
app.use("/farmerProducts", farmerProductRouter);

// ✅ Order routes - USE THE ROUTER
app.use("/sellerorder", sellerOrderRouter); // This handles all /sellerorder/* routes
app.use("/farmerorder", farmerOrderRouter);

// Other routes
app.use("/deliverypost", deliveryPostRouter);
app.use("/schemes", schemesRouter);
app.use("/appliedschemes", appliedSchemesRoutes);

// ✅ REMOVED: Duplicate product routes that were here
// All product routes are now handled by productRouter

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running", 
    status: "OK",
    uploadsPath: "/uploads",
    timestamp: new Date().toISOString()
  });
});

// -------------------- ERROR HANDLING --------------------
// Handle multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size is too large. Max limit is 5MB" });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: err.message });
  }
  next();
});

// 404 handler - This should be LAST
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.url);
  res.status(404).json({ error: "Route not found", path: req.url });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🖼️  Static files served at: http://localhost:${PORT}/uploads`);
  console.log(`\n📋 Available routes:`);
  console.log(`   - POST   /product/add`);
  console.log(`   - GET    /product/farmer/:farmerId/category/:category`);
  console.log(`   - GET    /product/farmer/:farmerId`);
  console.log(`   - GET    /product/name/:productName`);
  console.log(`   - GET    /product/category/:category`);
  console.log(`   - POST   /sellerorder/add`);
  console.log(`   - GET    /sellerorder/farmer/:farmerId`);
});