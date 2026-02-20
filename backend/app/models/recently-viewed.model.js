import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        viewedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a user doesn't have duplicate "recently viewed" entries for the same course in quick succession
// or we can handle it in the controller by updating the viewedAt timestamp.
// For now, let's keep it simple.

const RecentlyViewed = mongoose.model("RecentlyViewed", recentlyViewedSchema);
export default RecentlyViewed;
