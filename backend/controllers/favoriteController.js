
const Favorite = require("../models/Favorite");
const Book = require("../models/Book");

// Add book to Favorites
const addFavorite = async (req, res) => {
    try {
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                message: "Book ID is required"
            });
        }

        // Check whether this book belongs to logged-in user
        const book = await Book.findOne({
            _id: bookId,
            userId: req.user.id
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const existingFavorite = await Favorite.findOne({
            userId: req.user.id,
            bookId
        });

        if (existingFavorite) {
            return res.status(400).json({
                message: "Book is already in Favorites"
            });
        }

        const favorite = await Favorite.create({
            userId: req.user.id,
            bookId
        });

        res.status(201).json({
            message: "Book added to Favorites successfully",
            favorite
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding Favorite",
            error: error.message
        });
    }
};


// Get logged-in user's Favorites
const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({
            userId: req.user.id
        }).populate("bookId");

        res.status(200).json({
            message: "Favorites fetched successfully",
            totalFavorites: favorites.length,
            favorites
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching Favorites",
            error: error.message
        });
    }
};


// Remove book from Favorites
const removeFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!favorite) {
            return res.status(404).json({
                message: "Favorite not found"
            });
        }

        res.status(200).json({
            message: "Book removed from Favorites successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error removing Favorite",
            error: error.message
        });
    }
};


module.exports = {
    addFavorite,
    getFavorites,
    removeFavorite
};
