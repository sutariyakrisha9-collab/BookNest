
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const issueRoutes = require("./routes/issueRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

// 1. CORS Middleware
app.use(cors({

    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true

}));

// 2. Body Parser
app.use(express.json());

// 3. API Routes
app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/favorites", favoriteRoutes);

// 4. Home Route
app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "Welcome to BookNest Library Management System!"

    });

});

// 5. API Test Route
app.get("/api", (req, res) => {

    res.status(200).json({

        success: true,

        message: "BookNest API is Running Successfully!"

    });

});

// 6. 404 Error Handler
app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: `Route Not Found: ${req.originalUrl}`

    });

});

// 7. Server and Database
const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(
                `BookNest Server Running on Port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Server Startup Failed:",
            error.message
        );

        process.exit(1);

    }

};

startServer();
