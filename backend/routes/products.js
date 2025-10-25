const express = require("express");
const router = express.Router();
const Product = require("../model/Product");
const multer = require("multer");
const path = require("path");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ IMPORTANT: Specific routes MUST come BEFORE general routes!

// ✅ 1. Get products by farmer and category (MOST SPECIFIC - FIRST!)
router.get("/farmer/:farmerId/category/:category", async (req, res) => {
  try {
    const { farmerId, category } = req.params;
    
    console.log(`🔍 Fetching products for farmer ${farmerId} in category ${category}`);
    
    const products = await Product.find({ 
      farmerId: farmerId,
      category: category 
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching farmer products:", err);
    res.status(500).json({ 
      message: "Error fetching products",
      error: err.message 
    });
  }
});

// ✅ 2. Get all products by farmer
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    console.log(`🔍 Fetching all products for farmer ${farmerId}`);
    
    const products = await Product.find({ farmerId: farmerId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching farmer products:", err);
    res.status(500).json({ 
      message: "Error fetching products",
      error: err.message 
    });
  }
});

// ✅ 3. Get product by name
router.get("/name/:productName", async (req, res) => {
  try {
    const productName = req.params.productName;
    
    console.log(`🔍 Looking for product: ${productName}`);
    
    const product = await Product.findOne({ productName: productName })
      .populate('farmerId');
    
    if (!product) {
      console.log(`❌ Product not found: ${productName}`);
      return res.status(404).json({ message: "Product not found" });
    }
    
    console.log(`✅ Product found:`, product);
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product by name:", err);
    res.status(500).json({ 
      message: "Error fetching product",
      error: err.message 
    });
  }
});

// ✅ 4. Get products by category (all farmers)
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category })
      .populate('farmerId')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products in category: ${category}`);
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products by category:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ 5. POST add new product with farmerId
router.post("/add", upload.single("productImage"), async (req, res) => {
  try {
    const { productName, category, quantity, price, farmerId } = req.body;
    
    console.log("📝 Received product data:", {
      productName,
      category,
      quantity,
      price,
      farmerId,
      hasFile: !!req.file
    });
    
    // ✅ Validate required fields
    if (!productName || !category || !quantity || !price) {
      console.error("❌ Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields: productName, category, quantity, price" 
      });
    }
    
    // ✅ Validate farmerId
    if (!farmerId) {
      console.error("❌ Missing farmerId");
      return res.status(400).json({ 
        message: "Farmer ID is required" 
      });
    }
    
    let productImage = "";
    if (req.file) {
      productImage = `/uploads/${req.file.filename}`;
      console.log("📷 Image uploaded:", productImage);
    }
    
    const newProduct = new Product({
      productName,
      category,
      quantity: Number(quantity),
      price: Number(price),
      productImage,
      farmerId // ✅ CRITICAL: Store farmerId
    });
    
    const savedProduct = await newProduct.save();
    
    console.log("✅ Product created successfully:", savedProduct._id);
    
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).json({ 
      message: "Internal server error",
      error: err.message 
    });
  }
});

// ✅ 6. PATCH/UPDATE product
router.patch("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    console.log(`📝 Updating product ${productId}:`, updateData);
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      console.log(`❌ Product not found: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }
    
    console.log("✅ Product updated successfully");
    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ 
      message: "Error updating product",
      error: err.message 
    });
  }
});

// ✅ 7. DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    
    console.log(`🗑️ Deleting product: ${productId}`);
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      console.log(`❌ Product not found: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }
    
    console.log("✅ Product deleted successfully");
    res.json({ 
      message: "Product deleted successfully",
      product: deletedProduct 
    });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ 
      message: "Error deleting product",
      error: err.message 
    });
  }
});

// ✅ 8. GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId)
      .populate('farmerId');
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ 
      message: "Error fetching product",
      error: err.message 
    });
  }
});

// ✅ 9. GET all products (LEAST SPECIFIC - LAST!)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate('farmerId')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching all products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;