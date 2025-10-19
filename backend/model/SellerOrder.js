
const mongoose = require("mongoose");

const sellerOrderSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Made optional since OrderPage doesn't send this
  item: { type: String, required: true },
  productImage: String,
  category: String,
  quantity: { type: Number, required: true },
  price: Number,
  district: String,
  company: String,
  mobile: String,
  email: String,
  address: String,
  postedDate: String, // ✅ Added for order placement date
  expireDate: String, // Changed from Date to String for consistency
  status: { type: String, default: "pending" }, // Changed default to lowercase
  deliverymanId: { type: mongoose.Schema.Types.ObjectId, ref: "Deliveryman", default: null },
}, {
  timestamps: true // ✅ Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("SellerOrder", sellerOrderSchema);