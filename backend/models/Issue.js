
const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({

    // Book being issued
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    // Owner of this library's issue record
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Person borrowing the book
    borrowerName: {
        type: String,
        required: [true, "Borrower name is required"],
        trim: true
    },

    borrowerEmail: {
        type: String,
        required: [true, "Borrower email is required"],
        trim: true,
        lowercase: true
    },

    issueDate: {
        type: Date,
        default: Date.now
    },

    dueDate: {
        type: Date,
        required: [true, "Due date is required"]
    },

    returnDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ["Issued", "Returned"],
        default: "Issued"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Issue", issueSchema);
