import Content from "../models/content.model.js";
import Course from "../models/course.model.js";
import Section from "../models/section.model.js";
import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import Review from "../models/review.model.js";
import getEmbedding from "../utils/embedding.js";

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
      embedding,
      thumbnail,
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
            const content = await Content.create({
              ...contentData,
              section: section._id,
            });
            section.contents.push(content._id);
          }
          await section.save();
        }
      }
      await course.save();
    }

    const populatedCourse = await Course.findById(course._id).populate({
      path: "sections",
      populate: {
        path: "contents",
        model: "Content",
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
      isFree,
      courseType,
      sections,
      thumbnail,
      syllabus,
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
    course.embedding = embedding;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;

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
            const content = await Content.create({
              ...contentData,
              section: section._id,
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

    const populatedCourse = await Course.findById(id).populate({
      path: "sections",
      populate: {
        path: "contents",
        model: "Content",
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
