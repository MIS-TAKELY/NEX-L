require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  const Review = mongoose.model('Review', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    rating: Number,
    comment: String,
  }, { timestamps: true }));
  
  const Course = mongoose.model('Course', new mongoose.Schema({
    title: String,
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    ratings: {
      average: Number,
      count: Number,
    },
  }));
  
  const totalReviews = await Review.find().lean();
  console.log('Total reviews in Review collection:', totalReviews.length);
  
  // Group reviews by course
  const reviewsByCourse = {};
  totalReviews.forEach(r => {
    const courseId = r.course?.toString();
    if (courseId) {
      if (!reviewsByCourse[courseId]) reviewsByCourse[courseId] = [];
      reviewsByCourse[courseId].push(r._id);
    }
  });
  
  console.log('Courses with reviews:', Object.keys(reviewsByCourse).length);
  
  for (const [courseId, reviewIds] of Object.entries(reviewsByCourse)) {
    const result = await Course.updateOne(
      { _id: courseId },
      { $set: { reviews: reviewIds } }
    );
    console.log(`Course ${courseId}: matched=${result.matchedCount}, modified=${result.modifiedCount}, reviewIds=${reviewIds.length}`);
  }
  
  // Also fix courses that have ratings.count > 0 but empty reviews array
  const fixResult = await Course.updateMany(
    { 'ratings.count': { $gt: 0 }, $or: [{ reviews: { $exists: false } }, { reviews: { $size: 0 } }] },
    { $set: { reviews: [] } }
  );
  console.log(`\nCourses with ratings but empty reviews (just in case): matched=${fixResult.matchedCount}`);
  
  // Verify: check a course that now has reviews populated
  const course = await Course.findOne({ reviews: { $ne: [] } }).select('title reviews ratings').lean();
  if (course) {
    console.log('\nVerified course:', course.title, 'has', course.reviews.length, 'reviews');
  } else {
    console.log('\nNo course with reviews found after backfill');
  }
  
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
