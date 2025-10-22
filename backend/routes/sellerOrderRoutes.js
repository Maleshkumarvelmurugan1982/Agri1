const express = require("express");
const router = express.Router();
const SellerOrder = require("../model/SellerOrder"); // Your Mongoose model

// GET all seller orders
router.get("/", async (req, res) => {
  try {
    const orders = await SellerOrder.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - deliveryman accepts the order
router.put("/:id/accept", async (req, res) => {
  try {
    const order = await SellerOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.acceptedByDeliveryman = true;
    order.deliverymanId = req.body.deliverymanId; // optional: store who accepted
    await order.save();

    res.json({ message: "Order accepted by deliveryman", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
