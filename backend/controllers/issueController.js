
const Issue = require("../models/Issue");
const Book = require("../models/Book");

// ===================================
// 1. ISSUE A BOOK
// ===================================
exports.issueBook = async (req, res) => {
    try {
        const { bookId, borrowerName, borrowerEmail, dueDate } = req.body;

        // Validate required fields
        if (!bookId || !borrowerName || !borrowerEmail || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate due date
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime()) ||
            parsedDueDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Due date must be a valid future date"
            });
        }

        // Find book belonging to logged-in user
        const book = await Book.findOne({
            _id: bookId,
            userId: req.user.id
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Check availability
        if (book.availableCopies < 1) {
            return res.status(400).json({
                success: false,
                message: "No available copies of this book"
            });
        }

        // Reduce available copies
        book.availableCopies -= 1;
        await book.save();

        // Create issue record
        const issue = await Issue.create({
            bookId: book._id,
            userId: req.user.id,
            borrowerName,
            borrowerEmail,
            dueDate: parsedDueDate
        });

        res.status(201).json({
            success: true,
            message: "Book issued successfully!",
            issue
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===================================
// 2. GET ALL ISSUED BOOKS
// ===================================
exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({
            userId: req.user.id
        })
        .populate("bookId", "title author category coverImage")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalIssues: issues.length,
            issues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===================================
// 3. RETURN A BOOK
// ===================================
exports.returnBook = async (req, res) => {
    try {
        const issue = await Issue.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue record not found"
            });
        }

        if (issue.status === "Returned") {
            return res.status(400).json({
                success: false,
                message: "This book has already been returned"
            });
        }

        const book = await Book.findOne({
            _id: issue.bookId,
            userId: req.user.id
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Increase available copies
        book.availableCopies += 1;
        await book.save();

        // Update issue record
        issue.status = "Returned";
        issue.returnDate = new Date();
        await issue.save();

        res.status(200).json({
            success: true,
            message: "Book returned successfully!",
            issue
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
