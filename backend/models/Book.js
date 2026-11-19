
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, "Book title is required"],
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    author: {
        type: String,
        required: [true, "Author name is required"],
        trim: true
    },

    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    isbn: {
        type: String,
        trim: true,
        default: ""
    },

    publishedYear: {
        type: Number
    },

    totalCopies: {
        type: Number,
        default: 1,
        min: 1
    },

    availableCopies: {
        type: Number,
        default: 1,
        min: 0
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Book", bookSchema);
