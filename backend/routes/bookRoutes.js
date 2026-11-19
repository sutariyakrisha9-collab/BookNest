const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

const { body, validationResult } = require("express-validator");

// Validation Middleware
const validateBook = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();

};

// Add Book
router.post(
    "/",
    protect,
    [
        body("title")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Title must be 2 to 100 characters"),

        body("author")
            .trim()
            .notEmpty()
            .withMessage("Author is required"),

        body("category")
            .trim()
            .notEmpty()
            .withMessage("Category is required"),

        body("totalCopies")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Total copies must be at least 1"),

        body("publishedYear")
            .optional({ values: "falsy" })
            .isInt({ min: 1000, max: 2100 })
            .withMessage("Enter a valid published year")
    ],
    validateBook,
    addBook
);

// Get All Books
router.get("/", protect, getBooks);

// Get Single Book
router.get("/:id", protect, getBookById);

// Update Book
router.put(
    "/:id",
    protect,
    [
        body("title")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }),

        body("author")
            .optional()
            .trim()
            .notEmpty(),

        body("category")
            .optional()
            .trim()
            .notEmpty(),

        body("totalCopies")
            .optional()
            .isInt({ min: 1 }),

        body("publishedYear")
            .optional({ values: "falsy" })
            .isInt({ min: 1000, max: 2100 })
    ],
    validateBook,
    updateBook
);

// Delete Book
router.delete("/:id", protect, deleteBook);

module.exports = router;
