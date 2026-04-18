const User = require("../models/User"); 
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");

   const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
     user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    console.log("📥 Received registration request:", req.body); // ✅ Add this
    
  const { name, email, password, role } = req.body;
    
    console.log("Extracted:", { name, email, password }); // ✅ Add this

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ User already exists:", email); // ✅ Add this
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
       role: role || "user"
    });
    
    console.log("✅ User created successfully:", user); // ✅ Add this

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role  
}
    });

  } catch (error) {
    console.error("❌ Registration error:", error); // ✅ Add this
    res.status(500).json({ message: error.message });
  }
};



// ================= GET PROFILE =================
const getUserProfile = async (req, res) => {
  try {
    // req.user should be set by authMiddleware
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated",
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE/UNSAVE ITEM (Wishlist) =================
const saveItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    // Check if already saved
    const alreadySaved = user.savedItems.some(item => 
      item.productId.toString() === productId
    );

    if (alreadySaved) {
      // Remove from saved
      user.savedItems = user.savedItems.filter(
        item => item.productId.toString() !== productId
      );
      await user.save();
      return res.json({ 
        message: "Item removed from saved", 
        saved: false,
        savedCount: user.savedItems.length 
      });
    } else {
      // Add to saved
      user.savedItems.push({ productId, addedAt: new Date() });
      await user.save();
      return res.json({ 
        message: "Item saved successfully", 
        saved: true,
        savedCount: user.savedItems.length 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedItems.productId');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const savedProducts = user.savedItems
      .filter(item => item.productId) // Filter out any null products
      .map(item => ({
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        description: item.productId.description,
        image: item.productId.image,
        savedAt: item.addedAt
      }));
    
    res.json(savedProducts);
  } catch (error) {
    console.error("Error getting saved items:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD TO PURCHASE HISTORY =================
const addToPurchaseHistory = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    // Add each item to purchase history
    for (const item of items) {
      user.purchaseHistory.push({
        productId: item._id,
        productName: item.name,
        productPrice: item.price,
        productImage: item.image,
        quantity: item.quantity,
        totalAmount: item.price * item.quantity,
        purchaseDate: new Date(),
        status: "Completed"
      });
    }
    
    await user.save();
    
    res.json({ 
      message: "Purchase history updated", 
      historyCount: user.purchaseHistory.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PURCHASE HISTORY =================
const getPurchaseHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Sort by purchase date (newest first)
    const history = user.purchaseHistory.sort((a, b) => 
      b.purchaseDate - a.purchaseDate
    );
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE WITH ALL DATA =================
const getFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedItems.productId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedItems = user.savedItems
      .filter(item => item.productId)
      .map(item => ({
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        description: item.productId.description,
        image: item.productId.image,
        category: item.productId.category,
        savedAt: item.addedAt
      }));

    const purchaseHistory = user.purchaseHistory
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      .map(item => ({
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        productImage: item.productImage,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        purchaseDate: item.purchaseDate,
        status: item.status
      }));

    const totalSpent = purchaseHistory.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      savedItems,
      purchaseHistory,
      stats: {
        totalSaved: savedItems.length,
        totalPurchases: purchaseHistory.length,
        totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  saveItem,
  getSavedItems,
  addToPurchaseHistory,
  getPurchaseHistory,
  getFullProfile
};