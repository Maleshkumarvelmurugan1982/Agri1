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
  status: { 
    type: String, 
    enum: ["pending", "approved", "disapproved"],
    default: "pending" 
  },
  
  // ✅ CRITICAL: Track which SELLER created this order
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Seller",  // Reference to Seller model
    required: true  // Every order must have a seller
  },
  
  // ✅ Track which FARMER this order is sent to (the product owner)
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Farmer",
    required: true  // Every order must be associated with a farmer
  },
  
  // ✅ Track if deliveryman accepted this order
  acceptedByDeliveryman: { 
    type: Boolean, 
    default: false 
  },
  
  // ✅ Track which deliveryman is assigned
  deliverymanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Deliveryman", 
    default: null 
  },
  
  // ✅ Track delivery status
  deliveryStatus: {
    type: String,
    enum: ["pending", "in-transit", "delivered", "not-delivered"],
    default: "pending",
  },
  
  // ✅ Additional useful fields
  farmerApprovalDate: {
    type: Date,
    default: null
  },
  
  deliveryAcceptedDate: {
    type: Date,
    default: null
  },
  
  deliveryCompletedDate: {
    type: Date,
    default: null
  },
  
  // ✅ Order notes/remarks
  sellerNotes: {
    type: String,
    default: ""
  },
  
  farmerNotes: {
    type: String,
    default: ""
  },
  
  deliveryNotes: {
    type: String,
    default: ""
  }
  
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// ✅ Indexes for faster queries

// Index for seller-specific queries (most important for seller page)
sellerOrderSchema.index({ sellerId: 1 });

// Index for farmer-specific queries (most important for farmer page)
sellerOrderSchema.index({ farmerId: 1 });

// Index for deliveryman-specific queries
sellerOrderSchema.index({ deliverymanId: 1 });

// Index for status queries
sellerOrderSchema.index({ status: 1 });

// Compound indexes for common query patterns
sellerOrderSchema.index({ sellerId: 1, status: 1 });
sellerOrderSchema.index({ farmerId: 1, status: 1 });
sellerOrderSchema.index({ deliverymanId: 1, deliveryStatus: 1 });

// Index for date-based queries
sellerOrderSchema.index({ createdAt: -1 });

// ✅ Virtual for order age (days since creation)
sellerOrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ✅ Virtual for checking if order is expired
sellerOrderSchema.virtual('isExpired').get(function() {
  if (!this.expireDate) return false;
  return new Date(this.expireDate) < new Date();
});

// ✅ Pre-save middleware to update approval dates
sellerOrderSchema.pre('save', function(next) {
  // Set farmer approval date when status changes to approved/disapproved
  if (this.isModified('status') && !this.farmerApprovalDate) {
    if (this.status === 'approved' || this.status === 'disapproved') {
      this.farmerApprovalDate = new Date();
    }
  }
  
  // Set delivery accepted date when deliveryman accepts
  if (this.isModified('acceptedByDeliveryman') && this.acceptedByDeliveryman && !this.deliveryAcceptedDate) {
    this.deliveryAcceptedDate = new Date();
  }
  
  // Set delivery completed date when delivery is marked as delivered
  if (this.isModified('deliveryStatus') && this.deliveryStatus === 'delivered' && !this.deliveryCompletedDate) {
    this.deliveryCompletedDate = new Date();
  }
  
  next();
});

// ✅ Instance method to check if order can be accepted by deliveryman
sellerOrderSchema.methods.canBeAcceptedByDeliveryman = function() {
  return this.status === 'approved' && !this.acceptedByDeliveryman;
};

// ✅ Instance method to check if order can be approved/disapproved by farmer
sellerOrderSchema.methods.canBeReviewedByFarmer = function() {
  return this.status === 'pending';
};

// ✅ Static method to get seller's orders
sellerOrderSchema.statics.getSellerOrders = function(sellerId, options = {}) {
  const query = { sellerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('farmerId', 'fname lname email mobile')
    .populate('deliverymanId', 'fname lname email mobile')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);
};

// ✅ Static method to get farmer's orders (orders sent to a specific farmer)
sellerOrderSchema.statics.getFarmerOrders = function(farmerId, options = {}) {
  const query = { farmerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('sellerId', 'name email mobile')
    .populate('deliverymanId', 'fname lname email mobile')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);
};

// ✅ Static method to get deliveryman's orders
sellerOrderSchema.statics.getDeliverymanOrders = function(deliverymanId, options = {}) {
  const query = { deliverymanId };
  
  if (options.deliveryStatus) {
    query.deliveryStatus = options.deliveryStatus;
  }
  
  return this.find(query)
    .populate('sellerId', 'name email mobile')
    .populate('farmerId', 'fname lname email mobile')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);
};

// ✅ Static method to get pending orders for farmers (awaiting farmer approval)
sellerOrderSchema.statics.getPendingFarmerOrders = function(farmerId) {
  return this.find({ farmerId, status: 'pending' })
    .populate('sellerId', 'name email mobile')
    .sort({ createdAt: -1 });
};

// ✅ Static method to get approved orders available for deliverymen
sellerOrderSchema.statics.getAvailableDeliveryOrders = function(options = {}) {
  return this.find({ 
    status: 'approved', 
    acceptedByDeliveryman: false 
  })
    .populate('sellerId', 'name email mobile district')
    .populate('farmerId', 'fname lname email mobile district')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

module.exports = mongoose.model("SellerOrder", sellerOrderSchema);