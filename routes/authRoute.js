const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  saveItem,
  getSavedItems,
  addToPurchaseHistory,
  getPurchaseHistory,
  getFullProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getUserProfile);
router.get("/full-profile", authMiddleware, getFullProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.post("/save-item", authMiddleware, saveItem);
router.get("/saved-items", authMiddleware, getSavedItems);
router.post("/purchase-history", authMiddleware, addToPurchaseHistory);
router.get("/purchase-history", authMiddleware, getPurchaseHistory);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;