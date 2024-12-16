const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();


// MongoDB URI
const uri = "srvandpass";

// Secret for JWT
const SECRET = "jwt_secret";

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const nameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const Name = mongoose.model("Name", nameSchema);

// MongoDB Connection
async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connect();

// Routes
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, SECRET);
      res.json({ user: { username: user.username }, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/names", authenticate, async (req, res) => {
  try {
    const names = await Name.find({ userId: req.user.id });
    res.json({ names: names.map((n) => n.name) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch names" });
  }
});

app.post("/names", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const newName = new Name({ userId: req.user.id, name });
    await newName.save();
    res.status(201).json({ message: "Name added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add name" });
  }
});

// Authentication Middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

// Start Server
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
