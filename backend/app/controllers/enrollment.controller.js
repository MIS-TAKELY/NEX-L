import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import { parseRolesFromUser } from "../lib/roles.js";

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Student already enrolled in this course" });
    }

    const enrollment = new Enrollment({
      student: userId,
      course: courseId,
      payment: paymentId || null,
    });

    await enrollment.save();

    // Also update course's enrollments array if it's used there
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrollments: enrollment._id }
    });

    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new enrollment (Legacy/Internal)
export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, paymentId } = req.body;

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      payment: paymentId || null,
    });

    await enrollment.save();

    res.status(201).json({ message: "Enrollment created", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all enrollments
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title");

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "name email")
      .populate("course", "title");

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete enrollment
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark content as completed and update progress percentage
export const markContentCompleted = async (req, res) => {
  try {
    const { enrollmentId, contentId } = req.body;
    const userId = req.user?.id || req.user?._id;

    const enrollment = await Enrollment.findById(enrollmentId).populate({
      path: 'course',
      populate: {
        path: 'sections',
        populate: {
          path: 'contents'
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Ownership check: only the enrolled student can mark content as completed
    if (enrollment.student.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only mark your own enrollments" });
    }

    // Add content to completedContents if not already there
    if (!enrollment.completedContents.includes(contentId)) {
      enrollment.completedContents.push(contentId);
    }

    // Calculate new progress percentage
    let totalContents = 0;
    enrollment.course.sections.forEach(section => {
      totalContents += section.contents.length;
    });

    const completedCount = enrollment.completedContents.length;
    const progress = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;

    enrollment.progress = progress;
    if (progress === 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();

    res.json({ 
      success: true, 
      message: "Content marked as completed", 
      progress,
      completedContents: enrollment.completedContents 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update enrollment progress (optional legacy)
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true },
    );

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Progress updated", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all enrollments for a specific user
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id || req.user?._id;
    
    // Authenticated users can only see their own enrollments
    if (currentUserId?.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only view your own enrollments" });
    }
    
    const enrollments = await Enrollment.find({ student: userId })
      .populate({
        path: "course",
        populate: {
          path: "teacher",
          select: "name email"
        }
      });

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get stats for an instructor
export const getInstructorStats = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Ownership check: instructors can only view their own stats
    const currentUserId = req.user?.id || req.user?._id;
    const userRoles = parseRolesFromUser(req.user);
    const isAdmin = userRoles.includes("admin");
    if (currentUserId?.toString() !== instructorId?.toString() && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only view your own stats" });
    }

    // 1. Get all courses by this instructor
    const courses = await Course.find({ teacher: instructorId });
    const courseIds = courses.map((c) => c._id);

    // 2. Get all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).populate('payment');

    // 3. Calculate stats
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    const totalStudents = new Set(enrollments.map((e) => e.student.toString())).size;
    
    // Revenue calculation
    const totalRevenue = enrollments.reduce((sum, e) => {
        return sum + (e.payment?.amount || 0);
    }, 0);

    // Average rating
    const ratings = courses.map(c => c.ratings?.average || 0).filter(r => r > 0);
    const averageRating = ratings.length > 0 
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0;

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalEnrollments,
        totalStudents,
        totalRevenue,
        averageRating,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get list of students for an instructor
// Get enrollment by student and course
export const getEnrollmentByCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const currentUserId = req.user?.id || req.user?._id;
    
    // Students can only check their own enrollment; instructors can check their students
    if (currentUserId?.toString() !== studentId?.toString()) {
      // Check if the requester is an instructor for this course
      const course = await Course.findById(courseId).select("teacher");
      if (!course || course.teacher.toString() !== currentUserId?.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInstructorStudents = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Ownership check: instructors can only view their own students
    const currentUserId = req.user?.id || req.user?._id;
    const userRoles = parseRolesFromUser(req.user);
    const isAdmin = userRoles.includes("admin");
    if (currentUserId?.toString() !== instructorId?.toString() && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only view your own students" });
    }

    // Get all courses by this instructor
    const courses = await Course.find({ teacher: instructorId });
    const courseIds = courses.map((c) => c._id);

    // Get all enrollments with student details
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "name email avatar")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students: enrollments.map(e => ({
        id: e._id,
        studentId: e.student?._id,
        name: e.student?.name || "Unknown",
        email: e.student?.email || "N/A",
        courseId: e.course?._id,
        course: e.course?.title || "Deleted Course",
        progress: e.progress || 0,
        date: e.createdAt,
        avatar: e.student?.avatar || ""
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
