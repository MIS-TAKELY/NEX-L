import LiveClass from "../models/live-class.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

// ─── Helper: check enrollment ───────────────────────────────────────────────
const isEnrolled = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "enrolled",
  });
  return !!enrollment;
};

// ─── Helper: mark stale live classes as completed ─────────────────────────────
const autoCompleteStaleClasses = async (courseId) => {
  try {
    const now = new Date();
    // Find all classes that are "live" for this course
    const liveClasses = await LiveClass.find({
      course: courseId,
      status: "live",
    });

    for (const lc of liveClasses) {
      // If session is older than 6 hours since startTime, it's definitely stale
      // Or if it's 2 hours past its scheduled duration
      const startTime = new Date(lc.startTime);
      const scheduledEndTime = new Date(startTime.getTime() + (lc.duration || 60) * 60000);
      const staleThreshold = new Date(scheduledEndTime.getTime() + 2 * 60 * 60000); // 2 hours after scheduled end
      const maxAgeThreshold = new Date(startTime.getTime() + 6 * 60 * 60000); // 6 hours total age

      if (now > staleThreshold || now > maxAgeThreshold) {
        lc.status = "completed";
        await lc.save();
        console.log(`Auto-completed stale live class: ${lc._id} for course ${courseId}`);
      }
    }
  } catch (error) {
    console.error("autoCompleteStaleClasses error:", error);
  }
};

// ─── Create Live Class (teacher only) ───────────────────────────────────────
export const createLiveClass = async (req, res) => {
  try {
    const { courseId, title, description, startTime, duration } = req.body;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.teacher) !== teacherId) {
      return res.status(403).json({ message: "Only the course instructor can schedule live classes" });
    }

    const liveClass = new LiveClass({
      course: courseId,
      teacher: teacherId,
      title,
      description,
      startTime,
      duration,
      meetingId: `live-${courseId}`, // Using the deterministic callId for now
    });

    await liveClass.save();

    res.status(201).json({
      message: "Live class scheduled successfully",
      liveClass,
    });
  } catch (error) {
    console.error("createLiveClass error:", error);
    res.status(500).json({ message: error.message || "Failed to schedule live class" });
  }
};

// ─── Get all scheduled classes for a course ──────────────────────────────────
export const getCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isTeacher = String(course.teacher) === user.id;
    const enrolled = await isEnrolled(user.id, courseId);

    if (!isTeacher && !enrolled) {
      return res.status(403).json({ message: "Access denied. Purchase the course first." });
    }

    // Attempt to clear any stale "live" sessions first
    await autoCompleteStaleClasses(courseId);

    const liveClasses = await LiveClass.find({ course: courseId }).sort({ startTime: 1 });
    res.json(liveClasses);
  } catch (error) {
    console.error("getCourseLiveClasses error:", error);
    res.status(500).json({ message: "Failed to fetch live classes" });
  }
};

// ─── Get upcoming live classes for student ───────────────────────────────────
export const getStudentUpcomingClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all active enrollments for the student
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    }).select("course");

    const courseIds = enrollments.map((e) => e.course);

    const upcomingClasses = await LiveClass.find({
      course: { $in: courseIds },
      $or: [
        { status: "live" },
        { startTime: { $gte: new Date() } }
      ]
    })
      .populate("course", "title thumbnail")
      .populate("teacher", "name image")
      .sort({ startTime: 1 });

    res.json(upcomingClasses);
  } catch (error) {
    console.error("getStudentUpcomingClasses error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming classes" });
  }
};

// ─── Update Live Class (teacher only) ─────────────────────────────────────────
export const updateLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, startTime, duration, status } = req.body;
    const teacherId = req.user.id;

    const liveClass = await LiveClass.findById(classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    if (String(liveClass.teacher) !== teacherId) {
      return res.status(403).json({ message: "Access denied" });
    }

    liveClass.title = title || liveClass.title;
    liveClass.description = description || liveClass.description;
    liveClass.startTime = startTime || liveClass.startTime;
    liveClass.duration = duration || liveClass.duration;
    liveClass.status = status || liveClass.status;

    await liveClass.save();

    res.json({
      message: "Live class updated successfully",
      liveClass,
    });
  } catch (error) {
    console.error("updateLiveClass error:", error);
    res.status(500).json({ message: "Failed to update live class" });
  }
};

// ─── Delete Live Class (teacher only) ─────────────────────────────────────────
export const deleteLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    const liveClass = await LiveClass.findById(classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    if (String(liveClass.teacher) !== teacherId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await liveClass.deleteOne();

    res.json({ message: "Live class cancelled successfully" });
  } catch (error) {
    console.error("deleteLiveClass error:", error);
    res.status(500).json({ message: "Failed to delete live class" });
  }
};
// ─── End all live sessions for a course (teacher only) ───────────────────────
export const endAllCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.teacher) !== teacherId) {
      return res.status(403).json({ message: "Only the instructor can end live sessions" });
    }

    // Set all "live" classes for this course to "completed"
    const result = await LiveClass.updateMany(
      { course: courseId, status: "live" },
      { $set: { status: "completed" } }
    );

    res.json({
      message: "Successfully completed all live sessions for the course",
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("endAllCourseLiveClasses error:", error);
    res.status(500).json({ message: "Failed to end live classes" });
  }
};

// ─── Get all active live classes for an instructor ──────────────────────────
export const getInstructorActiveClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Find all courses by this teacher
    const courses = await Course.find({ teacher: teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    // Find any "live" classes for these courses
    const activeClasses = await LiveClass.find({
      course: { $in: courseIds },
      status: "live",
    }).populate("course", "title");

    res.json(activeClasses);
  } catch (error) {
    console.error("getInstructorActiveClasses error:", error);
    res.status(500).json({ message: "Failed to fetch active classes" });
  }
};
