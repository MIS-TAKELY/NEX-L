import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    // Legacy support for single course payments
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    amount: {
      type: Number,
      required: true,
    },
    gateway: {
      type: String,
      enum: [
        "esewa",
        "khalti",
        "imepay",
        "connectips",
        "fonepay",
        "mobilebanking",
      ],
      required: true,
    },
    transactionId: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    couponUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
