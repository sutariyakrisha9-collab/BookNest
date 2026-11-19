const express = require("express");

const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const { body, validationResult } = require("express-validator");

// Validation Middleware
const validateRequest = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();
};


// REGISTER API
router.post(
    "/register",
    [
        body("name")
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage("Name must be 3 to 50 characters"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],
    validateRequest,
    register
);


// LOGIN API
router.post(
    "/login",
    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    validateRequest,
    login
);


// PROTECTED PROFILE API
router.get("/me", protect, (req, res) => {

    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        user: req.user
    });

});

module.exports = router;