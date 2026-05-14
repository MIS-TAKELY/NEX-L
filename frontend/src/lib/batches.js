const STORAGE_KEY = "nexl_instructor_batches";

export const readBatches = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const writeBatches = (batches) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
};

export const getBatchesForTeacher = (teacherId) => {
  if (!teacherId) return [];
  return readBatches().filter((batch) => batch.teacherId === teacherId);
};

export const getBatchesForCourse = (courseId) => {
  if (!courseId) return [];
  return readBatches().filter((batch) => batch.courseId === courseId);
};

export const getBatchesForStudent = (student) => {
  if (!student) return [];
  return readBatches().filter((batch) => isStudentAssignedToBatch(batch, student));
};

const getStudentIdentity = (student) =>
  String(
    student?.studentId ||
      student?.id ||
      student?._id ||
      student?.email ||
      ""
  ).trim();

export const getBatchAssignedStudents = (batch) => {
  if (!batch || !Array.isArray(batch.assignedStudents)) return [];
  return batch.assignedStudents.filter(Boolean);
};

export const getBatchAssignmentMode = (batch) => {
  if (!batch) return "open";
  if (batch.assignmentMode === "automatic") return "automatic";
  if (batch.assignmentMode === "manual") return "manual";
  return getBatchAssignedStudents(batch).length > 0 ? "manual" : "open";
};

export const normalizeBatchStudents = (students = []) => {
  const seen = new Set();

  return students.reduce((acc, student) => {
    const id = getStudentIdentity(student);
    if (!id || seen.has(id)) return acc;

    seen.add(id);
    acc.push({
      id,
      studentId: student.studentId || student.id || student._id || id,
      name: student.name || student.fullName || student.email || "Unnamed student",
      email: student.email || "",
      courseId: student.courseId || "",
      avatar: student.avatar || "",
      progress: typeof student.progress === "number" ? student.progress : null,
      date: student.date || student.createdAt || null,
    });
    return acc;
  }, []);
};

export const isStudentAssignedToBatch = (batch, student) => {
  const assignedStudents = getBatchAssignedStudents(batch);
  if (assignedStudents.length === 0) return false;

  const studentKeys = new Set(
    [
      student?.studentId,
      student?.id,
      student?._id,
      student?.email,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim())
  );

  return assignedStudents.some((assignedStudent) =>
    [
      assignedStudent.id,
      assignedStudent.studentId,
      assignedStudent._id,
      assignedStudent.email,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim())
      .some((value) => studentKeys.has(value))
  );
};

export const getBatchAssignedStudentCount = (batch) =>
  getBatchAssignedStudents(batch).length;

export const getStudentBatchBadges = (student) =>
  getBatchesForStudent(student).map((batch) => ({
    id: `batch-badge-${batch.id}`,
    name: `${batch.batchName} Member`,
    description: `You are assigned to ${batch.courseTitle}${batch.batchCode ? ` • ${batch.batchCode}` : ""}.`,
    icon: "🪪",
    type: "batch_membership",
    level: "silver",
    threshold: 0,
    awardedAt: batch.updatedAt || batch.createdAt,
    awardedFor: batch.assignedTeacher
      ? `Assigned by ${batch.assignedTeacher}`
      : "Batch membership",
    batchId: batch.id,
    batchCode: batch.batchCode,
    batchName: batch.batchName,
    courseId: batch.courseId,
    courseTitle: batch.courseTitle,
  }));

export const createBatchId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const slugifyBatchCode = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
