
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addFavorite,
    getFavorites,
    removeFavorite
} = require("../controllers/favoriteController");

// Add book to Favorites
router.post("/", protect, addFavorite);

// Get all Favorites
router.get("/", protect, getFavorites);

// Remove book from Favorites
router.delete("/:id", protect, removeFavorite);

module.exports = router;
