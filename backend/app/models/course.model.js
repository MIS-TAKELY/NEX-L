import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  tags: [String],
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    default: 0,
  },
  discountPrice: Number,
  isFree: {
    type: Boolean,
    default: false,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
  },
  syllabus: {
    type: String,
  },
  demoVideo: {
    type: String,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  }],
  enrollments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  embedding: [Number],
  thumbnail: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  courseType: {
    type: String,
    enum: ['full', 'syllabus'],
    default: 'full',
  },
}, {
  timestamps: true,
});

courseSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);
export default Course; 
