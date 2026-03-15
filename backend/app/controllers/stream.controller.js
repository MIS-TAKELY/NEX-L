import { getStreamClient } from "../utils/stream.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";

// ─── Helper: check enrollment ───────────────────────────────────────────────
const isEnrolled = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "enrolled",
  });
  return !!enrollment;
};

// ─── Generate Stream Chat token ──────────────────────────────────────────────
export const generateToken = async (req, res) => {
  try {
    const client = getStreamClient();
    const user = req.user;

    // Upsert user in Stream
    await client.upsertUser({
      id: user.id,
      name: user.name,
      image: user.image || "",
      role: user.role === "teacher" ? "user" : "user",
    });

    const token = client.createToken(user.id);
    res.json({ token, userId: user.id, userName: user.name });
  } catch (error) {
    console.error("generateToken error:", error);
    res.status(500).json({ message: "Failed to generate Stream token" });
  }
};

// ─── Generate Stream Video token ─────────────────────────────────────────────
export const generateVideoToken = async (req, res) => {
  try {
    const client = getStreamClient();
    const user = req.user;

    // Upsert user
    await client.upsertUser({
      id: user.id,
      name: user.name,
      image: user.image || "",
    });

    const token = client.createToken(user.id);
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error("generateVideoToken error:", error);
    res.status(500).json({ message: "Failed to generate video token" });
  }
};

// ─── Get/Create 1-on-1 DM channel (student ↔ teacher) ───────────────────────
export const getOrCreateDirectChannel = async (req, res) => {
  try {
    const { courseId } = req.params;
    const client = getStreamClient();
    const student = req.user;

    // Verify enrollment
    const enrolled = await isEnrolled(student.id, courseId);
    if (!enrolled) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const course = await Course.findById(courseId).populate("teacher");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const teacher = course.teacher;
    const channelId = `dm-${[student.id, String(teacher._id)].sort().join("-")}`;

    // Upsert both users
    await client.upsertUsers([
      { id: student.id, name: student.name, image: student.image || "" },
      { id: String(teacher._id), name: teacher.name, image: teacher.image || "" },
    ]);

    const channel = client.channel("messaging", channelId, {
      members: [student.id, String(teacher._id)],
      name: `Chat: ${student.name} & ${teacher.name}`,
      created_by_id: student.id,
    });

    await channel.create();

    res.json({
      channelId,
      channelType: "messaging",
      teacherId: String(teacher._id),
      teacherName: teacher.name,
    });
  } catch (error) {
    console.error("getOrCreateDirectChannel error:", error);
    res.status(500).json({ message: "Failed to create direct channel" });
  }
};

// ─── Get/Create course group channel ─────────────────────────────────────────
export const getOrCreateGroupChannel = async (req, res) => {
  try {
    const { courseId } = req.params;
    const client = getStreamClient();
    const user = req.user;

    const course = await Course.findById(courseId)
      .populate("teacher")
      .populate({ path: "enrollments", populate: { path: "student" } });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const isTeacher = String(course.teacher._id) === user.id;
    const enrolled = await isEnrolled(user.id, courseId);

    if (!isTeacher && !enrolled) {
      return res.status(403).json({ message: "Access denied. Purchase the course first." });
    }

    const channelId = `course-${courseId}`;

    // Build members list: teacher + all enrolled students
    const memberIds = [String(course.teacher._id)];
    if (course.enrollments) {
      for (const enrollment of course.enrollments) {
        if (enrollment.student) memberIds.push(String(enrollment.student._id));
      }
    }
    const uniqueMembers = [...new Set(memberIds)];

    // Upsert teacher
    await client.upsertUser({
      id: String(course.teacher._id),
      name: course.teacher.name,
      image: course.teacher.image || "",
    });

    const channel = client.channel("messaging", channelId, {
      members: uniqueMembers,
      name: `${course.title} – Group Chat`,
      created_by_id: String(course.teacher._id),
      course_id: courseId,
    });

    await channel.create();

    res.json({
      channelId,
      channelType: "messaging",
      courseName: course.title,
    });
  } catch (error) {
    console.error("getOrCreateGroupChannel error:", error);
    res.status(500).json({ message: "Failed to create group channel" });
  }
};

// ─── Create Live Stream (teacher only) ───────────────────────────────────────
export const createLiveStream = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacher = req.user;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.teacher) !== teacher.id) {
      return res.status(403).json({ message: "Only the course teacher can start a live stream" });
    }

    // The call ID is deterministic per course; teacher can restart the same room
    const callId = `live-${courseId}`;

    res.json({
      callId,
      callType: "livestream",
      courseId,
      courseName: course.title,
    });
  } catch (error) {
    console.error("createLiveStream error:", error);
    res.status(500).json({ message: "Failed to create live stream" });
  }
};

// ─── Get Live Stream info ─────────────────────────────────────────────────────
export const getLiveStream = async (req, res) => {
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

    const callId = `live-${courseId}`;
    res.json({ callId, callType: "livestream", courseId, courseName: course.title });
  } catch (error) {
    console.error("getLiveStream error:", error);
    res.status(500).json({ message: "Failed to get live stream" });
  }
};

// ─── Create Video Call (student requests, teacher accepts) ────────────────────
export const createVideoCall = async (req, res) => {
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

    const callId = `videocall-${courseId}-${user.id}`;
    res.json({ callId, callType: "default", courseId });
  } catch (error) {
    console.error("createVideoCall error:", error);
    res.status(500).json({ message: "Failed to create video call" });
  }
};
