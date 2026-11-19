const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folder if not exists
const uploadPath = "uploads/books";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

// File Validation
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }

};

// Multer Configuration
const upload = multer({

    storage: storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: fileFilter

});

module.exports = upload;