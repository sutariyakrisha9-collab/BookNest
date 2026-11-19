const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    issueBook,
    getIssues,
    returnBook
} = require("../controllers/issueController");

// Issue a book
router.post("/", protect, issueBook);

// Get all issue records
router.get("/", protect, getIssues);

// Return a book
router.put("/:id/return", protect, returnBook);

module.exports = router;
