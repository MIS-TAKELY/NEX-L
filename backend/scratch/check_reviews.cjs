require('dotenv').config();
const mongoose = require('mongoose');
require('../app/models/review.model.js');
require('../app/models/user.model.js');
require('../app/models/course.model.js');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  
  const Course = mongoose.model('Course');
  const Review = mongoose.model('Review');
  
  // Check all reviews
  const allReviews = await Review.find().populate('user', 'name image').lean();
  console.log('Total reviews in DB:', allReviews.length);
  allReviews.forEach(r => {
    console.log('\nReview:', r._id);
    console.log('  rating:', r.rating);
    console.log('  comment:', r.comment ? r.comment.substring(0, 50) : '(empty)');
    console.log('  user:', JSON.stringify(r.user));
    console.log('  createdAt:', r.createdAt);
  });
  
  // Check a course with reviews populated
  const course = await Course.findOne({ reviews: { $ne: [] } }).select('title reviews ratings').populate({
    path: 'reviews',
    populate: { path: 'user', select: 'name image' },
    options: { sort: { createdAt: -1 } }
  }).lean();
  
  if (course) {
    console.log('\n\nCourse with reviews:', course.title);
    console.log('Reviews count:', course.reviews.length);
    course.reviews.forEach((r, i) => {
      console.log(`\nReview ${i}:`);
      console.log('  user:', JSON.stringify(r.user));
      console.log('  rating:', r.rating);
      console.log('  comment:', r.comment);
    });
  } else {
    console.log('\n\nNo course with reviews found');
  }
  
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
