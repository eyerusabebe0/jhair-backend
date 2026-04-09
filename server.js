require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoute = require("./routes/productRoute");
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'JHAIR Backend API is running!', status: 'online' });
});

app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);

// Health check (optional)
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// ✅ ONLY listen locally - NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ✅ Export for Vercel
module.exports = app;