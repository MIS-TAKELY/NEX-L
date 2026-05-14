import { useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useGetInstructorCoursesQuery } from "@/store/slices/courseApi";
import { useGetInstructorStudentsQuery } from "@/store/slices/enrollmentApi";
import { useToast } from "@/context/ToastContext";
import {
  createBatchId,
  getBatchesForTeacher,
  readBatches,
  normalizeBatchStudents,
  slugifyBatchCode,
  writeBatches,
} from "@/lib/batches";

const Batches = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();

  const teacherId = userData?.id;
  const { data: courses = [], isLoading } = useGetInstructorCoursesQuery(teacherId, {
    skip: !teacherId,
  });
  const { data: studentsData = {}, isLoading: isLoadingStudents } = useGetInstructorStudentsQuery(
    teacherId,
    {
      skip: !teacherId,
    }
  );

  const [, forceRefresh] = useReducer((value) => value + 1, 0);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [form, setForm] = useState(() => ({
    courseId: searchParams.get("courseId") || "",
    assignedTeacher: "",
    assignmentMode: "manual",
    assignedStudents: [],
    batchName: "",
    batchCode: "",
    schedule: "",
    startDate: "",
    capacity: "",
    description: "",
  }));
  const [studentQuery, setStudentQuery] = useState("");

  const batches = teacherId
    ? getBatchesForTeacher(teacherId)
    : [];

  const selectedCourse = courses.find((course) => course._id === form.courseId);
  const courseStudents = normalizeBatchStudents(
    (studentsData?.students || []).filter((student) =>
      form.courseId ? String(student.courseId) === String(form.courseId) : true
    )
  );
  const filteredStudents = courseStudents.filter((student) => {
    const search = studentQuery.trim().toLowerCase();
    if (!search) return true;
    return [student.name, student.email, student.studentId, student.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });
  const selectedStudentIds = new Set(form.assignedStudents.map((student) => student.id));

  const resetForm = (courseId = form.courseId) => {
    setForm({
      courseId,
      assignedTeacher: "",
      assignmentMode: "manual",
      assignedStudents: [],
      batchName: "",
      batchCode: "",
      schedule: "",
      startDate: "",
      capacity: "",
      description: "",
    });
    setStudentQuery("");
    setEditingBatchId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      if (name === "courseId") {
        return {
          ...prev,
          courseId: value,
          assignedStudents: [],
        };
      }

      if (name === "assignmentMode") {
        return {
          ...prev,
          assignmentMode: value,
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const toggleStudent = (student) => {
    setForm((prev) => {
      const exists = prev.assignedStudents.some((item) => item.id === student.id);
      return {
        ...prev,
        assignedStudents: exists
          ? prev.assignedStudents.filter((item) => item.id !== student.id)
          : [...prev.assignedStudents, student],
      };
    });
  };

  const startEdit = (batch) => {
    setEditingBatchId(batch.id);
    setStudentQuery("");
    setForm({
      courseId: batch.courseId || "",
      assignedTeacher: batch.assignedTeacher || "",
      assignmentMode:
        batch.assignmentMode || ((batch.assignedStudents || []).length > 0 ? "manual" : "manual"),
      assignedStudents: normalizeBatchStudents(batch.assignedStudents || []),
      batchName: batch.batchName || "",
      batchCode: batch.batchCode || "",
      schedule: batch.schedule || "",
      startDate: batch.startDate || "",
      capacity: batch.capacity ? String(batch.capacity) : "",
      description: batch.description || "",
    });
  };

  const cancelEdit = () => {
    resetForm(searchParams.get("courseId") || "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!teacherId) {
      showToast("You must be logged in to create batches.", "error");
      return;
    }

    if (!form.courseId) {
      showToast("Select a course first.", "error");
      return;
    }

    if (!form.batchName.trim()) {
      showToast("Batch name is required.", "error");
      return;
    }

    const course = courses.find((item) => item._id === form.courseId);
    const batchCode =
      form.batchCode.trim() ||
      `${slugifyBatchCode(course?.title || form.batchName).toUpperCase()}-${String(
        batches.length + 1
      ).padStart(3, "0")}`;
    const assignedStudents =
      form.assignmentMode === "automatic"
        ? courseStudents
        : normalizeBatchStudents(form.assignedStudents);

    const newBatch = {
      id: createBatchId(),
      teacherId,
      assignedTeacher: form.assignedTeacher.trim() || userData?.name || "Current Teacher",
      assignmentMode: form.assignmentMode,
      assignedStudents,
      courseId: form.courseId,
      courseTitle: course?.title || "Untitled Course",
      batchName: form.batchName.trim(),
      batchCode,
      schedule: form.schedule.trim(),
      startDate: form.startDate,
      capacity: form.capacity ? Number(form.capacity) : null,
      description: form.description.trim(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const nextBatches = editingBatchId
      ? readBatches().map((batch) =>
          batch.id === editingBatchId
            ? {
                ...batch,
                teacherId,
                assignedTeacher: newBatch.assignedTeacher,
                assignmentMode: newBatch.assignmentMode,
                assignedStudents: newBatch.assignedStudents,
                courseId: newBatch.courseId,
                courseTitle: newBatch.courseTitle,
                batchName: newBatch.batchName,
                batchCode: newBatch.batchCode,
                schedule: newBatch.schedule,
                startDate: newBatch.startDate,
                capacity: newBatch.capacity,
                description: newBatch.description,
                updatedAt: new Date().toISOString(),
              }
            : batch
        )
      : [...readBatches(), newBatch];
    writeBatches(nextBatches);
    forceRefresh();
    resetForm(form.courseId);
    showToast(
      editingBatchId ? "Batch updated successfully." : "Batch created successfully.",
      "success"
    );
  };

  const updateBatch = (batchId, updater) => {
    const nextBatches = readBatches().map((batch) =>
      batch.id === batchId ? updater(batch) : batch
    );
    writeBatches(nextBatches);
    forceRefresh();
  };

  const handleToggleStatus = (batchId) => {
    updateBatch(batchId, (batch) => ({
      ...batch,
      status: batch.status === "active" ? "paused" : "active",
    }));
  };

  const handleDelete = (batchId) => {
    const nextBatches = readBatches().filter((batch) => batch.id !== batchId);
    writeBatches(nextBatches);
    forceRefresh();
    showToast("Batch removed.", "success");
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-muted-foreground">
        Loading batches...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Batch Management
          </p>
          <h1 className="text-2xl font-black text-foreground">Create manual batches</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create batches for any of your courses, keep them organized, and manage them without
            waiting on automation.
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/courses")}
          className="w-fit rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Back to courses
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-md border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {editingBatchId ? "Edit batch" : "Add batch"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingBatchId
                ? "Update the batch details and save your changes."
                : "Fill the details manually and save it."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Course
              </span>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Batch name
              </span>
              <input
                name="batchName"
                value={form.batchName}
                onChange={handleChange}
                placeholder="Morning Batch A"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assign to teacher
              </span>
              <input
                name="assignedTeacher"
                value={form.assignedTeacher}
                onChange={handleChange}
                placeholder="Teacher name, email, or ID"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to assign it to you.
              </p>
            </label>

            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Student assignment
              </span>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-4">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="manual"
                    checked={form.assignmentMode === "manual"}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">Manual selection</p>
                    <p className="text-xs text-muted-foreground">
                      Pick specific students for this batch.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-4">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="automatic"
                    checked={form.assignmentMode === "automatic"}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">Automatic assignment</p>
                    <p className="text-xs text-muted-foreground">
                      Snapshot all enrolled students for the selected course.
                    </p>
                  </div>
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {selectedCourse
                  ? form.assignmentMode === "automatic"
                    ? `${courseStudents.length} students will be attached when you save this batch.`
                    : `${form.assignedStudents.length} student${form.assignedStudents.length === 1 ? "" : "s"} selected manually.`
                  : "Choose a course first to load the student list."}
              </p>
            </div>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Batch code
              </span>
              <input
                name="batchCode"
                value={form.batchCode}
                onChange={handleChange}
                placeholder="AUTO if empty"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Start date
              </span>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Capacity
              </span>
              <input
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="30"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Schedule
              </span>
              <input
                name="schedule"
                value={form.schedule}
                onChange={handleChange}
                placeholder="Mon-Wed-Fri, 7:00 PM - 8:30 PM"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add notes for this batch, admission rules, or classroom details."
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {form.assignmentMode === "manual" ? (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Select students</h3>
                  <p className="text-xs text-muted-foreground">
                    {courseStudents.length === 0
                      ? "No students found for this course yet."
                      : "Choose the students that should belong to this batch."}
                  </p>
                </div>
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search students"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary md:max-w-xs"
                />
              </div>

              {isLoadingStudents ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No matching students found.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => toggleStudent(student)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {student.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {student.email || "No email"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Automatic assignment will copy the current enrolled students from the selected course.
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {selectedCourse
                ? editingBatchId
                  ? `Batch will be updated for ${selectedCourse.title}.`
                  : `Batch will be created for ${selectedCourse.title}.`
                : "No course selected yet."}
            </p>
            <div className="flex items-center gap-3">
              {editingBatchId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Icon
                  icon={editingBatchId ? "solar:pen-bold-duotone" : "solar:add-circle-bold"}
                  className="h-5 w-5"
                />
                {editingBatchId ? "Update batch" : "Save batch"}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4 rounded-md border border-border bg-card p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-foreground">Saved batches</h2>
            <p className="text-sm text-muted-foreground">
              {batches.length} batch{batches.length === 1 ? "" : "es"} available
            </p>
          </div>

          {batches.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No batches added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <article key={batch.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{batch.batchName}</h3>
                        <span
                          className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                            batch.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {batch.courseTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assignment:{" "}
                        <span className="font-semibold text-foreground">
                          {batch.assignmentMode === "automatic"
                            ? "Automatic"
                            : batch.assignmentMode === "manual"
                              ? "Manual"
                              : "Open"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned to:{" "}
                        <span className="font-semibold text-foreground">
                          {batch.assignedTeacher || "Current Teacher"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Students:{" "}
                        <span className="font-semibold text-foreground">
                          {(batch.assignedStudents || []).length}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Code: {batch.batchCode}
                      </p>
                      {batch.updatedAt ? (
                        <p className="text-[11px] text-muted-foreground">
                          Updated: {new Date(batch.updatedAt).toLocaleString()}
                        </p>
                      ) : null}
                      {(batch.assignedStudents || []).length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(batch.assignedStudents || []).slice(0, 3).map((student) => (
                            <span
                              key={student.id}
                              className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary"
                            >
                              {student.name}
                            </span>
                          ))}
                          {(batch.assignedStudents || []).length > 3 ? (
                            <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                              +{(batch.assignedStudents || []).length - 3} more
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(batch)}
                        className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(batch.id)}
                        className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
                      >
                        Toggle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(batch.id)}
                        className="rounded-md border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Start date
                      </p>
                      <p>{batch.startDate || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Capacity
                      </p>
                      <p>{batch.capacity || "Unlimited"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Schedule
                      </p>
                      <p>{batch.schedule || "Not set"}</p>
                    </div>
                  </div>

                  {batch.description ? (
                    <p className="mt-4 rounded-md bg-muted/50 p-3 text-sm text-foreground">
                      {batch.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Batches;
