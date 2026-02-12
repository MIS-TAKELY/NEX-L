import Cart from "../models/cart.model.js";
import Course from "../models/course.model.js";

// Fetch user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ user: userId }).populate("items.course");

        if (!cart) {
            // Create an empty cart if it doesn't exist
            cart = await Cart.create({ user: userId, items: [] });
        }

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching cart",
            error: error.message,
        });
    }
};

// Add course to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if course is already in cart
        const exists = cart.items.find((item) => item.course.toString() === courseId);
        if (exists) {
            return res.status(400).json({ success: false, message: "Course already in cart" });
        }

        cart.items.push({ course: courseId });
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.course");

        res.status(200).json({
            success: true,
            message: "Added to cart",
            data: updatedCart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding to cart",
            error: error.message,
        });
    }
};

// Remove course from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter((item) => item.course.toString() !== courseId);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate("items.course");

        res.status(200).json({
            success: true,
            message: "Removed from cart",
            data: updatedCart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing from cart",
            error: error.message,
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error clearing cart",
            error: error.message,
        });
    }
};
