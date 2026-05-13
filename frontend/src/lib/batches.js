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
