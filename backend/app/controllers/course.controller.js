import Cart from "../models/cart.model.js";
import Content from "../models/content.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import RecentlyViewed from "../models/recently-viewed.model.js";
import Section from "../models/section.model.js";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Assignment from "../models/assignment.model.js";
import getEmbedding from "../utils/embedding.js";
import { cosineSimilarity, getAggregateVector } from "../utils/vector-utils.js";
import { generateCourseContent as generateAIContent } from "../utils/ai-generator.js";

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      teacherId,
      tags,
      category,
      price,
      isFree,
      courseType,
      sections,
      thumbnail,
      syllabus,
      demoVideo,
      status,
    } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(400).json({ message: "Teacher not found" });

    // Generate embedding
    let embedding = [];
    try {
      const textToEmbed = `${title} ${description} ${category} ${tags ? tags.join(" ") : ""}`;
      embedding = await getEmbedding(textToEmbed);
      // Double check it's flattened for DB safety
      if (Array.isArray(embedding[0])) {
        embedding = embedding[0];
      }
    } catch (embedErr) {
      console.error("Failed to generate embedding:", embedErr);
      // Proceed without embedding or fail? Usually proceed, but for this task embedding is key.
      // We will log it.
    }

    const course = await Course.create({
      title,
      description,
      teacher: teacher._id,
      tags,
      category,
      price,
      isFree,
      courseType,
      syllabus,
      demoVideo,
      embedding,
      thumbnail,
      status,
    });

    // Handle nested sections if provided
    if (sections && Array.isArray(sections)) {
      for (const sectionData of sections) {
        const section = await Section.create({
          title: sectionData.title,
          course: course._id,
          order: sectionData.order,
        });

        course.sections.push(section._id);

        if (sectionData.contents && Array.isArray(sectionData.contents)) {
          for (const contentData of sectionData.contents) {
            let quizId = contentData.quizId || null;
            let assignmentId = contentData.assignmentId || null;

            if (contentData.type === 'quiz' && contentData.quizData) {
               if (quizId) {
                 await Quiz.findByIdAndUpdate(quizId, { ...contentData.quizData, title: contentData.title });
               } else {
                 const quiz = await Quiz.create({ ...contentData.quizData, title: contentData.title, course: course._id, section: section._id });
                 quizId = quiz._id;
               }
            }

            if (contentData.type === 'assignment' && contentData.assignmentData) {
               if (assignmentId) {
                 await Assignment.findByIdAndUpdate(assignmentId, { ...contentData.assignmentData, title: contentData.title, description: contentData.description });
               } else {
                 const assignment = await Assignment.create({ ...contentData.assignmentData, title: contentData.title, description: contentData.description, course: course._id });
                 assignmentId = assignment._id;
               }
            }

            const content = await Content.create({
              title: contentData.title,
              type: contentData.type,
              url: contentData.url,
              summary: contentData.summary,
              description: contentData.description,
              duration: contentData.duration,
              resources: contentData.resources,
              isPreview: contentData.isPreview,
              section: section._id,
              quiz: quizId,
              assignment: assignmentId
            });
            section.contents.push(content._id);
          }
          await section.save();
        }
      }
      await course.save();
    }

    const populatedCourse = await Course.findById(course._id)
      .populate("teacher")
      .populate({
        path: "sections",
        populate: {
          path: "contents",
          model: "Content",
          populate: [
            { path: "quiz" },
            { path: "assignment" }
          ]
        },
      });

    res.status(201).json(populatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("-embedding")
      .populate("teacher"); // matches schema
    // .populate("enrollments"); // if you want to show enrolled students via enrollments

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Record course view
export const recordCourseView = async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ message: "Course ID and User ID are required" });
    }

    // Update if exists, otherwise create
    await RecentlyViewed.findOneAndUpdate(
      { user: userId, course: courseId },
      { viewedAt: Date.now() },
      { upsert: true, new: true },
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get course sections (Trending, Recently Viewed, Recommendation, Top Deals)
export const getCourseSections = async (req, res) => {
  try {
    const { userId } = req.query;

    // 1. Trending: Recently added + Most bought (enrollments)
    const trending = await Course.find({ status: "published" })
      .select("-embedding")
      .populate("teacher")
      .sort({ createdAt: -1 })
      .limit(4);
    // Note: In a real app, you'd calculate a trend score based on recent enrollments.

    // 2. Top Deals: Highest discount
    const topDeals = await Course.aggregate([
      {
        $match: {
          status: "published",
          discountPrice: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          discountPercentage: {
            $cond: [
              { $gt: ["$price", 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ["$price", "$discountPrice"] },
                      "$price",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { discountPercentage: -1 } },
      { $limit: 8 },
    ]);
    // Populate teacher manually after aggregate if needed, or use $lookup
    const populatedTopDeals = await Course.populate(topDeals, {
      path: "teacher",
    });

    let recentlyViewed = [];
    let recommendations = [];

    if (userId) {
      // 3. Recently Viewed
      const recentViews = await RecentlyViewed.find({ user: userId })
        .sort({ viewedAt: -1 })
        .limit(8)
        .populate({
          path: "course",
          populate: { path: "teacher" },
        });
      recentlyViewed = recentViews
        .map((rv) => rv.course)
        .filter((c) => c != null);

      // 4. Recommendation: Vector Similarity
      // Get user's context (recently viewed, cart, enrolled)
      const userViews = await RecentlyViewed.find({ user: userId }).populate(
        "course",
      );
      const userCart = await Cart.findOne({ user: userId }).populate(
        "items.course",
      );
      const userEnrollments = await Enrollment.find({
        student: userId,
      }).populate("course");

      const relevantCourses = [
        ...userViews.map((v) => v.course),
        ...(userCart ? userCart.items.map((i) => i.course) : []),
        ...userEnrollments.map((e) => e.course),
      ].filter((c) => c && c.embedding && c.embedding.length > 0);

      if (relevantCourses.length > 0) {
        const userVector = getAggregateVector(
          relevantCourses.map((c) => c.embedding),
        );

        // Find other courses (not already viewed/bought)
        const viewedCourseIds = relevantCourses.map((c) => c._id.toString());
        const otherCourses = await Course.find({
          status: "published",
          _id: { $nin: viewedCourseIds },
          embedding: { $exists: true, $not: { $size: 0 } },
        });

        const scoredCourses = otherCourses.map((course) => ({
          course,
          similarity: cosineSimilarity(userVector, course.embedding),
        }));

        recommendations = scoredCourses
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 8)
          .map((item) => {
            const c = item.course.toObject();
            delete c.embedding;
            return c;
          });

        // Populate teacher for recommendations
        recommendations = await Course.populate(recommendations, {
          path: "teacher",
        });
      }
    }

    // Default recommendations if none found or not logged in
    if (recommendations.length === 0) {
      const trendingIds = trending.map((c) => c._id.toString());
      recommendations = await Course.find({
        status: "published",
        _id: { $nin: trendingIds },
      })
        .select("-embedding")
        .populate("teacher")
        .sort({ "ratings.average": -1 })
        .limit(8);

      // if still empty (all courses are in trending), just get some published ones
      if (recommendations.length === 0 && trending.length > 0) {
        recommendations = await Course.find({ status: "published" })
          .select("-embedding")
          .populate("teacher")
          .sort({ "ratings.average": -1 })
          .limit(4);
      }
    }

    // 5. Category-wise Sections
    const distinctCategories = await Course.distinct("category", { status: "published" });
    const categorySections = await Promise.all(
      distinctCategories.map(async (cat) => {
        const courses = await Course.find({ category: cat, status: "published" })
          .select("-embedding")
          .populate("teacher")
          .limit(4);
        return { category: cat, courses };
      })
    );

    res.json({
      trending,
      recentlyViewed,
      recommendations,
      topDeals: populatedTopDeals,
      categorySections,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search courses using vector similarity and filters
export const searchCoursesVector = async (req, res) => {
  try {
    const { q, category, level, minPrice, maxPrice } = req.query;
    console.log(
      `[Search] Query: "${q}", Category: ${category}, Level: ${level}, Price: ${minPrice}-${maxPrice}`,
    );

    let queryVector = null;
    if (q) {
      // 1. Generate embedding for the query
      queryVector = await getEmbedding(q);
      console.log(`[Search] Generated query vector for: "${q}"`);
    }

    // 2. Build filter object
    const filter = { status: "published" };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && minPrice !== "all") filter.price.$gte = Number(minPrice);
      if (maxPrice && maxPrice !== "all") filter.price.$lte = Number(maxPrice);
    }

    console.log(`[Search] Mongoose filter:`, JSON.stringify(filter));

    // 3. Fetch courses with filters - EXPLICITLY check embedding exists
    const courses = await Course.find(filter).populate("teacher");
    console.log(
      `[Search] Found ${courses.length} courses matching basic filters`,
    );

    let results = [];

    if (queryVector) {
      // 4. Calculate similarity and score if query exists
      const scoredCourses = courses
        .filter((c) => {
          const hasEmbedding = c.embedding && c.embedding.length > 0;
          if (!hasEmbedding)
            console.log(`[Search] Excluded course ${c.title} (no embedding)`);
          return hasEmbedding;
        })
        .map((course) => {
          const similarity = cosineSimilarity(queryVector, course.embedding);
          return { course, similarity };
        });

      // 5. Sort by similarity
      results = scoredCourses
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20)
        .map((item) => {
          const c = item.course.toObject();
          delete c.embedding;
          c.similarityScore = item.similarity;
          return c;
        });

      if (results.length > 0) {
        console.log(
          `[Search] Top similarity score: ${results[0].similarityScore} for "${results[0].title}"`,
        );
      }
    } else {
      // Switch to simple list if no search query
      results = courses.map((course) => {
        const c = course.toObject();
        delete c.embedding;
        return c;
      });
    }

    res.json(results);
  } catch (err) {
    console.error("[Search] error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .select("-embedding")
      .populate({
        path: "teacher",
        select: "name email _id",
      })
      // .populate("enrollments")
      .populate({
        path: "sections",
        populate: {
          path: "contents",
          model: "Content",
          populate: [
            { path: "quiz" },
            { path: "assignment" }
          ]
        },
      });

    if (!course)
      return res
        .status(404)
        .json({ message: "Course not found", success: false });

    return res.status(200).json({
      message: "Successfully fetched course using Id",
      success: true,
      data: course,
    });
  } catch (err) {
    return res.status(500).json({
      message: `unable to get course details using id ${err.message}`,
      success: false,
    });
  }
};

// Enroll student in course
export const enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    if (!course || !student) {
      return res.status(400).json({ message: "Course or student not found" });
    }

    // Optional: check if already enrolled
    if (course.enrollments.includes(student._id)) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    // Push student ID into enrollments array (or you can create a separate Enrollment model)
    course.enrollments.push(student._id);
    await course.save();

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get instructor courses
export const getInstructorCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const courses = await Course.find({ teacher: teacherId })
      .populate("teacher")
      .populate("enrollments");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      tags,
      category,
      price,
      isFree,
      courseType,
      sections,
      thumbnail,
      syllabus,
      demoVideo,
      status,
    } = req.body;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Generate embedding if content changed
    let embedding = course.embedding;
    const oldText = `${course.title} ${course.description} ${course.category} ${course.tags ? course.tags.join(" ") : ""}`;
    const newText = `${title} ${description} ${category} ${tags ? tags.join(" ") : ""}`;

    if (oldText !== newText) {
      try {
        embedding = await getEmbedding(newText);
        if (Array.isArray(embedding[0])) {
          embedding = embedding[0];
        }
      } catch (embedErr) {
        console.error("Failed to update embedding:", embedErr);
      }
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.tags = tags || course.tags;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;
    course.isFree = isFree !== undefined ? isFree : course.isFree;
    course.courseType = courseType || course.courseType;
    course.syllabus = syllabus !== undefined ? syllabus : course.syllabus;
    course.demoVideo = demoVideo !== undefined ? demoVideo : course.demoVideo;
    course.embedding = embedding;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;
    course.status = status || course.status;

    // Handle sections update
    if (sections && Array.isArray(sections)) {
      // Simple approach: clear existing sections and recreate them
      // Alternatively, you could diff them, but for now, we'll recreate

      // Delete old sections and contents
      for (const sectionId of course.sections) {
        const section = await Section.findById(sectionId);
        if (section) {
          await Content.deleteMany({ _id: { $in: section.contents } });
          await Section.findByIdAndDelete(sectionId);
        }
      }

      const newSectionIds = [];
      for (const sectionData of sections) {
        const section = await Section.create({
          title: sectionData.title,
          course: course._id,
          order: sectionData.order,
        });

        if (sectionData.contents && Array.isArray(sectionData.contents)) {
          for (const contentData of sectionData.contents) {
            let quizId = contentData.quizId || null;
            let assignmentId = contentData.assignmentId || null;

            if (contentData.type === 'quiz' && contentData.quizData) {
               if (quizId) {
                 await Quiz.findByIdAndUpdate(quizId, { ...contentData.quizData, title: contentData.title });
               } else {
                 const quiz = await Quiz.create({ ...contentData.quizData, title: contentData.title, course: course._id, section: section._id });
                 quizId = quiz._id;
               }
            }

            if (contentData.type === 'assignment' && contentData.assignmentData) {
               if (assignmentId) {
                 await Assignment.findByIdAndUpdate(assignmentId, { ...contentData.assignmentData, title: contentData.title, description: contentData.description });
               } else {
                 const assignment = await Assignment.create({ ...contentData.assignmentData, title: contentData.title, description: contentData.description, course: course._id });
                 assignmentId = assignment._id;
               }
            }

            const content = await Content.create({
              title: contentData.title,
              type: contentData.type,
              url: contentData.url,
              summary: contentData.summary,
              description: contentData.description,
              duration: contentData.duration,
              resources: contentData.resources,
              isPreview: contentData.isPreview,
              section: section._id,
              quiz: quizId,
              assignment: assignmentId
            });
            section.contents.push(content._id);
          }
          await section.save();
        }
        newSectionIds.push(section._id);
      }
      course.sections = newSectionIds;
    }

    await course.save();

    const populatedCourse = await Course.findById(id)
      .populate("teacher")
      .populate({
        path: "sections",
        populate: {
          path: "contents",
          model: "Content",
          populate: [
            { path: "quiz" },
            { path: "assignment" }
          ]
        },
      });

    res.json(populatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Delete associated sections and contents
    for (const sectionId of course.sections) {
      const section = await Section.findById(sectionId);
      if (section) {
        await Content.deleteMany({ _id: { $in: section.contents } });
        await Section.findByIdAndDelete(sectionId);
      }
    }

    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate course content using AI
export const generateContent = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required", success: false });
    }

    const content = await generateAIContent(title);
    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (err) {
    res.status(500).json({
      message: `Failed to generate AI content: ${err.message}`,
      success: false,
    });
  }
};
