const mongoose = require("mongoose");

const sellerOrderSchema = new mongoose.Schema({
  name: { type: String, required: false },
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
  postedDate: String,
  expireDate: String,
  status: { type: String, default: "pending" },
  
  // ✅ NEW: Track if deliveryman accepted this order
  acceptedByDeliveryman: { type: Boolean, default: false },
  deliverymanId: { type: mongoose.Schema.Types.ObjectId, ref: "Deliveryman", default: null },
}, {
  timestamps: true
});

module.exports = mongoose.model("SellerOrder", sellerOrderSchema);
