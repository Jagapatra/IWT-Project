// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = 8000;

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://sauravmohanty043:tP1PWeDy9QAasGeE@cluster0.fvxp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        collection: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));


app.use(express.static(path.join(__dirname, "public")));

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000" }));

// Middleware for parsing form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// MongoDB setup
const mongoURI = "mongodb+srv://sauravmohanty043:tP1PWeDy9QAasGeE@cluster0.fvxp9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(mongoURI);
let db;

// Connect to MongoDB
client.connect()
    .then(() => {
        db = client.db("formDB");
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Check auth status route
app.get("/auth/status", (req, res) => {
    if (req.session.user) {
        res.json({ 
            isAuthenticated: true, 
            user: {
                name: req.session.user.name,
                email: req.session.user.email
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});


app.post("/register", upload.fields([{ name: "resume" }, { name: "photo" }]), async (req, res) => {
    try {
        const { name, id, password, email, age, gender, address, branch, skills } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const data = {
            name,
            id,
            password: hashedPassword,
            email,
            age,
            gender,
            address,
            branch,
            skills: Array.isArray(skills) ? skills : [skills],
            resumePath: req.files?.resume?.[0]?.path || null,
            photoPath: req.files?.photo?.[0]?.path || null,
        };

        const result = await db.collection("formData").insertOne(data);
        res.status(200).json({ message: "Registration successful!", userId: result.insertedId });
    } catch (err) {
        console.error("Error saving registration data:", err);
        res.status(500).json({ error: "An error occurred during registration." });
    }
});

// Login route with session
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const user = await db.collection("formData").findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Set user session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.status(200).json({ 
            message: "Login successful!",
            user: {
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "An error occurred during login." });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Could not log out." });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
