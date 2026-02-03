import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    password: { type: String }, // Optional for better-auth
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  },
  {
    timestamps: true,
    collection: "user" // Explicitly use better-auth's collection
  }
);

// Hash password before saving (only if password exists and is modified)
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
