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
import { generateCourseContent as generateAIContent, summarizeText, askQuestionToAI } from "../utils/ai-generator.js";

const CATEGORY_ALIASES = new Map([
  ["web development", "Development"],
  ["mobile development", "Development"],
  ["data science", "Development"],
  ["programming", "Development"],
  ["coding", "Development"],
  ["software development", "Development"],
  ["frontend", "Development"],
  ["backend", "Development"],
  ["development", "Development"],
  ["business", "Business"],
  ["marketing", "Marketing"],
  ["design", "Design"],
]);

const LEVEL_ALIASES = new Map([
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"],
]);

const normalizeCategory = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  return CATEGORY_ALIASES.get(raw.toLowerCase()) || raw;
};

const normalizeLevel = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  return LEVEL_ALIASES.get(raw.toLowerCase()) || raw;
};

const buildCategoryCondition = (category) => {
  if (!category) return null;

  const normalized = normalizeCategory(category);
  if (normalized === "Development") {
    return {
      $or: [
        { category: "Development" },
        { category: "Web Development" },
        { category: "Mobile Development" },
        { category: "Data Science" },
        { category: "Programming" },
        { category: "Coding" },
        { category: "Software Development" },
        { category: "Frontend" },
        { category: "Backend" },
      ],
    };
  }

  return {
    $or: [
      { category: normalized },
      { category: category },
    ],
  };
};

const buildEmbeddingText = ({ title, description, category, tags, level }) =>
  `${title || ""} ${description || ""} ${category || ""} ${level || ""} ${Array.isArray(tags) ? tags.join(" ") : ""}`.trim();

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      teacherId,
      tags,
      category,
      level,
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

    const normalizedCategory = normalizeCategory(category);
    const normalizedLevel = normalizeLevel(level) || "Beginner";

    // Generate embedding
    let embedding = [];
    try {
      const textToEmbed = buildEmbeddingText({
        title,
        description,
        category: normalizedCategory,
        level: normalizedLevel,
        tags,
      });
      if (textToEmbed) {
        embedding = await getEmbedding(textToEmbed);
        // Ensure it's a flat array
        if (Array.isArray(embedding[0])) {
          embedding = embedding[0];
        }
      }
    } catch (embedErr) {
      console.error("[Course] Failed to generate embedding:", embedErr.message);
    }

    // Approval Flow: If status is 'published' and user is not admin, set to 'pending'
    let finalStatus = status || 'draft';
    if (finalStatus === 'published') {
      // In a real app, check req.user.role here. 
      // For now, since requireAuth might not be consistently applied, 
      // let's assume all instructor submissions need approval.
      finalStatus = 'pending';
    }

    const course = await Course.create({
      title,
      description,
      teacher: teacher._id,
      tags,
      category: normalizedCategory,
      level: normalizedLevel,
      price,
      isFree,
      courseType,
      syllabus,
      demoVideo,
      embedding,
      thumbnail,
      status: finalStatus,
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

    const normalizedCategory = normalizeCategory(category);
    const normalizedLevel = normalizeLevel(level);
    const categoryCondition = buildCategoryCondition(normalizedCategory);
    let queryVector = null;
    if (q) {
      // 1. Generate embedding for the query
      try {
        queryVector = await getEmbedding(q);
        if (Array.isArray(queryVector?.[0])) {
          queryVector = queryVector[0];
        }
        console.log(`[Search] Generated query vector for: "${q}"`);
      } catch (embedErr) {
        console.error("[Search] Failed to generate query embedding:", embedErr.message);
        queryVector = null;
      }
    }

    const levelCondition = normalizedLevel
      ? {
          $or: [
            { level: normalizedLevel },
            { level: { $exists: false } },
            { level: null },
            { level: "" },
          ],
      }
      : null;
    const combinedConditions = [categoryCondition, levelCondition].filter(Boolean);

    // 2. Build filter object
    const filter = { status: "published" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && minPrice !== "all") filter.price.$gte = Number(minPrice);
      if (maxPrice && maxPrice !== "all") filter.price.$lte = Number(maxPrice);
    }

    // 3. Hybrid matching: Use text search if query exists
    let courses = [];
    if (q) {
      // Try text search + filtering
      const textQuery = {
        ...filter,
        $text: { $search: q },
        ...(combinedConditions.length === 1 ? combinedConditions[0] : combinedConditions.length > 1 ? { $and: combinedConditions } : {}),
      };
      const textMatches = await Course.find(
        textQuery,
        { score: { $meta: "textScore" } },
      ).populate("teacher");

      // Fallback: if text search fails (e.g., partial word), try regex
      const regexMatches = textMatches.length === 0 && q.length >= 3
        ? await Course.find(
          {
            ...filter,
            ...(combinedConditions.length > 0
              ? {
                  $and: [
                    ...combinedConditions,
                    {
                      $or: [
                        { title: { $regex: q, $options: "i" } },
                        { description: { $regex: q, $options: "i" } },
                        { category: { $regex: q, $options: "i" } },
                        { tags: { $regex: q, $options: "i" } },
                      ],
                    },
                  ],
                }
              : {
                  $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { category: { $regex: q, $options: "i" } },
                    { tags: { $regex: q, $options: "i" } },
                  ],
                }),
          },
        ).populate("teacher")
        : [];

      // Attach synthetic scores to regex matches
      regexMatches.forEach((c) => {
        if (!c._doc) c._doc = {};
        c._doc.score = 1.0;
      });

      courses = [...textMatches, ...regexMatches];

      // Complement with semantic search if text matches are low
      if (courses.length < 5) {
        const semanticFiltered = await Course.find({
          ...filter,
          ...(combinedConditions.length === 1 ? combinedConditions[0] : combinedConditions.length > 1 ? { $and: combinedConditions } : {}),
          _id: { $nin: courses.map(c => c._id) },
          embedding: { $exists: true, $type: "array" },
        }).populate("teacher").limit(100);
        courses = [...courses, ...semanticFiltered];
      }
    } else {
      courses = await Course.find({
        ...filter,
        ...(combinedConditions.length === 1 ? combinedConditions[0] : combinedConditions.length > 1 ? { $and: combinedConditions } : {}),
      }).populate("teacher");
    }

    console.log(
      `[Search] Found ${courses.length} potential courses matching query/filters`,
    );

    let results = [];

    if (queryVector) {
      // 4. Calculate similarity and apply ranking boosts
      const scoredCourses = courses
        .filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0)
        .map((course) => {
          const vectorSimilarity = cosineSimilarity(queryVector, course.embedding);
          
          // Heuristic Boosts
          let boost = 1.0;
          
          // Title Keyword Match Boost (High Priority)
          const lowerTitle = (course.title || "").toLowerCase();
          const lowerQuery = (q || "").toLowerCase();
          if (lowerTitle.includes(lowerQuery)) {
            boost += 0.6; // Strong boost for exact title substrings
          }
          
          // Quality Boost (Ratings)
          if (course.ratings?.average) {
            boost += (course.ratings.average / 5) * 0.2; // Up to +0.2 boost
          }
          
          // Popularity Boost (Enrollments)
          if (course.enrollments?.length) {
            boost += Math.min(course.enrollments.length / 100, 1) * 0.1; // Up to +0.1 boost
          }

          // Combine Similarity and Text Match Score
          // Note: course.score is the MongoDB text search score
          const textScore = course._doc?.score || 0;
          const normalizedTextScore = Math.min(textScore / 5, 2.0); // Cap text score impact
          
          const finalScore = (vectorSimilarity * 1.0 + (normalizedTextScore * 0.2)) * boost;

          return { course, similarity: vectorSimilarity, finalScore };
        });

      const rankedCourses = scoredCourses
        .sort((a, b) => b.finalScore - a.finalScore);

      // 5. Sort by the calculated final score and filter low relevance results
      results = rankedCourses
        .filter(item => item.finalScore > 0.28 || (item.course._doc && item.course._doc.score > 0))
        .slice(0, 30)
        .map((item) => {
          const c = item.course.toObject();
          delete c.embedding;
          c.similarityScore = item.similarity;
          c.searchRank = item.finalScore; // Debug info
          return c;
        });

      if (results.length === 0 && rankedCourses.length > 0) {
        results = rankedCourses.slice(0, 8).map((item) => {
          const c = item.course.toObject();
          delete c.embedding;
          c.similarityScore = item.similarity;
          c.searchRank = item.finalScore;
          return c;
        });
      }

      if (results.length > 0) {
        console.log(
          `[Search] Top rank score: ${results[0].searchRank.toFixed(4)} for "${results[0].title}"`,
        );
      } else if (q) {
        // 6. Keyword-based Category Fallback if nothing is found
        const qLower = q.toLowerCase();
        let fallbackCategory = null;
        
        if (/(python|java|c\+\+|programming|coding|web|dev|html|css|react|node|angular|vue|sql|javascript|js)/i.test(qLower)) {
            fallbackCategory = "Development";
        } else if (/(business|marketing|sales|seo|finance|management|startup)/i.test(qLower)) {
            fallbackCategory = "Business";
        } else if (/(design|ui|ux|figma|photoshop|illustrator|art|graphics|drawing)/i.test(qLower)) {
            fallbackCategory = "Design";
        }

        if (fallbackCategory) {
            console.log(`[Search] No direct matches for "${q}". Falling back to category: ${fallbackCategory}`);
            const fallbackCourses = await Course.find({
                status: "published",
                category: fallbackCategory
            }).populate("teacher").limit(8);
            
            results = fallbackCourses.map(course => {
                const c = course.toObject();
                delete c.embedding;
                return c;
            });
        }
      }
    } else {
      // Sort by recency if no query
      results = courses
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((course) => {
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
      level,
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

    // Generate embedding if content changed or is missing
    let embedding = course.embedding || [];
    const updatedTitle = title !== undefined ? title : course.title;
    const updatedDescription = description !== undefined ? description : course.description;
    const updatedCategory = category !== undefined ? normalizeCategory(category) : course.category;
    const updatedLevel = level !== undefined ? normalizeLevel(level) : course.level;
    const updatedTags = tags !== undefined ? tags : course.tags;

    const oldText = buildEmbeddingText({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      tags: course.tags,
    });
    const newText = buildEmbeddingText({
      title: updatedTitle,
      description: updatedDescription,
      category: updatedCategory,
      level: updatedLevel,
      tags: updatedTags,
    });

    if (oldText !== newText || !embedding || embedding.length === 0 || embedding.length !== 384) {
      try {
        if (newText) {
          console.log(`[Course] Refreshing embedding for "${updatedTitle}" (Dimensions: ${embedding.length} -> 384)`);
          embedding = await getEmbedding(newText);
          if (Array.isArray(embedding[0])) {
            embedding = embedding[0];
          }
        }
      } catch (embedErr) {
        console.error("[Course] Failed to update embedding:", embedErr.message);
      }
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.tags = tags || course.tags;
    course.category = category !== undefined ? normalizeCategory(category) : course.category;
    course.level = level !== undefined ? normalizeLevel(level) : course.level;
    course.price = price !== undefined ? price : course.price;
    course.isFree = isFree !== undefined ? isFree : course.isFree;
    course.courseType = courseType || course.courseType;
    course.syllabus = syllabus !== undefined ? syllabus : course.syllabus;
    course.demoVideo = demoVideo !== undefined ? demoVideo : course.demoVideo;
    course.embedding = embedding;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;
    
    let updatedStatus = status || course.status;
    if (updatedStatus === 'published' && course.status !== 'published') {
      // If trying to publish and not already published, set to pending
      updatedStatus = 'pending';
    }
    course.status = updatedStatus;

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

// Get instructor analytics
export const getInstructorAnalytics = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await Course.find({ teacher: teacherId });
    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overview: { totalViews: 0, totalCompletions: 0, activeStudents: 0, avgRating: 0 },
          courseStats: []
        }
      });
    }

    const courseIds = courses.map((c) => c._id);
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });

    let totalViews = 0;
    let totalCompletions = 0;
    let activeStudents = 0;
    let totalRating = 0;
    let ratedCoursesCount = 0;
    let totalIncome = 0;

    const courseStats = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course.toString() === course._id.toString());
      
      const views = courseEnrollments.length; // Approximate views as enrollments
      let completions = 0;
      let active = 0;
      let totalCourseProgress = 0;
      let courseIncome = 0;

      courseEnrollments.forEach(enrollment => {
        totalCourseProgress += (enrollment.progress || 0);
        if (enrollment.status === 'completed' || enrollment.progress === 100) {
          completions += 1;
        } else {
          active += 1;
        }

        // Calculate income: if it's not a free course, add the price
        // In a real system, we'd check the actual payment amount, 
        // but since we don't have a reliable per-course breakdown in bulk payments yet,
        // we'll use the course price at enrollment or current price.
        if (!course.isFree) {
          courseIncome += (course.discountPrice || course.price || 0);
        }
      });

      const averageProgress = courseEnrollments.length > 0 ? Math.round(totalCourseProgress / courseEnrollments.length) : 0;
      const rating = course.ratings?.average || 0;
      
      totalViews += views;
      totalCompletions += completions;
      activeStudents += active;
      totalIncome += courseIncome;

      if (rating > 0) {
        totalRating += rating;
        ratedCoursesCount += 1;
      }

      return {
        _id: course._id,
        name: course.title,
        views,
        completions,
        averageProgress,
        rating,
        income: courseIncome,
      };
    });

    const avgRating = ratedCoursesCount > 0 ? (totalRating / ratedCoursesCount).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalCompletions,
          activeStudents,
          avgRating,
          totalIncome,
        },
        courseStats,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message, success: false });
  }
};

// Summarize lesson content using AI
export const summarizeContent = async (req, res) => {
  try {
    const { text, mode, title, imageUrl, courseTitle } = req.body;
    console.log("AI Summary Request - Course:", courseTitle, "Title:", title, "Mode:", mode, "Has Image:", !!imageUrl);
    if (imageUrl) console.log("Incoming Image URL:", imageUrl);

    if (!text && !title && !imageUrl) {
      return res.status(400).json({ message: "Text, Title or Image is required", success: false });
    }

    const summary = await summarizeText(text, mode || 'short', title || '', imageUrl || '', courseTitle || '');
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    res.status(500).json({
      message: `Failed to summarize content: ${err.message}`,
      success: false,
    });
  }
};
// Ask AI about lesson content
export const askAIContent = async (req, res) => {
  try {
    const { question, context, courseTitle, imageUrl } = req.body;
    console.log(`[AI Q&A] New Question: "${question}" for Course: "${courseTitle}" ${imageUrl ? `with Image: ${imageUrl}` : ""}`);

    if (!question) {
      return res.status(400).json({ message: "Question is required", success: false });
    }

    const answer = await askQuestionToAI(question, context || '', courseTitle || '', imageUrl || '');
    
    res.status(200).json({
      success: true,
      data: answer,
    });
  } catch (err) {
    res.status(500).json({
      message: `Failed to get AI answer: ${err.message}`,
      success: false,
    });
  }
};
