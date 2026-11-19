
const Book = require("../models/Book");

// ADD BOOK
exports.addBook = async (req, res) => {

    try {

        const {
            title,
            author,
            category,
            description,
            isbn,
            publishedYear,
            totalCopies
        } = req.body;

        const copies = Number(totalCopies || 1);

        const book = await Book.create({

            title,
            author,
            category,
            description,
            isbn,
            publishedYear: publishedYear || undefined,

            totalCopies: copies,
            availableCopies: copies,

            userId: req.user._id

        });

        res.status(201).json({

            success: true,
            message: "Book added successfully",
            book

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// GET ALL BOOKS WITH SEARCH AND PAGINATION
exports.getBooks = async (req, res) => {

    try {

        const {
            search = "",
            category = "",
            page = 1,
            limit = 8,
            sort = "newest"
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);

        const pageLimit = Math.min(
            50,
            Math.max(1, Number(limit) || 8)
        );

        const query = {
            userId: req.user._id
        };

        // Search
        if (search.trim()) {

            query.$or = [

                {
                    title: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },

                {
                    author: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }

            ];

        }

        // Category Filter
        if (category.trim()) {
            query.category = category.trim();
        }

        // Sorting
        const sortOption = sort === "oldest"
            ? { createdAt: 1 }
            : sort === "title"
                ? { title: 1 }
                : { createdAt: -1 };

        // Total Books
        const totalBooks = await Book.countDocuments(query);

        // Fetch Books
        const books = await Book.find(query)
            .sort(sortOption)
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({

            success: true,

            totalBooks,

            currentPage,

            totalPages: Math.ceil(totalBooks / pageLimit),

            books

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// GET SINGLE BOOK
exports.getBookById = async (req, res) => {

    try {

        const book = await Book.findOne({

            _id: req.params.id,
            userId: req.user._id

        });

        if (!book) {

            return res.status(404).json({
                success: false,
                message: "Book not found"
            });

        }

        res.status(200).json({

            success: true,
            book

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// UPDATE BOOK
exports.updateBook = async (req, res) => {

    try {

        const book = await Book.findOne({

            _id: req.params.id,
            userId: req.user._id

        });

        if (!book) {

            return res.status(404).json({
                success: false,
                message: "Book not found"
            });

        }

        const {
            title,
            author,
            category,
            description,
            isbn,
            publishedYear,
            totalCopies
        } = req.body;

        if (title !== undefined) book.title = title;
        if (author !== undefined) book.author = author;
        if (category !== undefined) book.category = category;
        if (description !== undefined) book.description = description;
        if (isbn !== undefined) book.isbn = isbn;

        if (publishedYear !== undefined) {
            book.publishedYear = publishedYear;
        }

        if (totalCopies !== undefined) {

            const newTotal = Number(totalCopies);

            if (!Number.isInteger(newTotal) || newTotal < 1) {

                return res.status(400).json({
                    success: false,
                    message: "Total copies must be at least 1"
                });

            }

            const issuedCopies =
                book.totalCopies - book.availableCopies;

            if (newTotal < issuedCopies) {

                return res.status(400).json({
                    success: false,
                    message: "Total copies cannot be less than issued copies"
                });

            }

            book.totalCopies = newTotal;
            book.availableCopies = newTotal - issuedCopies;

        }

        await book.save();

        res.status(200).json({

            success: true,
            message: "Book updated successfully",
            book

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// DELETE BOOK
exports.deleteBook = async (req, res) => {

    try {

        const book = await Book.findOne({

            _id: req.params.id,
            userId: req.user._id

        });

        if (!book) {

            return res.status(404).json({
                success: false,
                message: "Book not found"
            });

        }

        await book.deleteOne();

        res.status(200).json({

            success: true,
            message: "Book deleted successfully"

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
