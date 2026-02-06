import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",

    },
    expiry: Date,
    maxUses: Number,
    uses: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
