const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

// ✅ Use the SAME variable name as in your server.js
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ MongoDB URI not found in .env file!");
  console.log("Please add MONGODB_URI to your .env file");
  process.exit(1);
}

console.log("Connecting to MongoDB...");

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    const email = "eyeru@gmail.com";
    const password = "1234567";

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("✅ Admin already exists:", email);
      console.log("Password is:", password);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit();
  });