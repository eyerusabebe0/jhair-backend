const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    addedAt: { type: Date, default: Date.now }
  }],
  purchaseHistory: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: String,
    productPrice: Number,
    productImage: String,
    quantity: Number,
    totalAmount: Number,
    purchaseDate: { type: Date, default: Date.now },
    status: { type: String, default: "Completed" }
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);