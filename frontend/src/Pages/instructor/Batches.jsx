import { useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useGetInstructorCoursesQuery } from "@/store/slices/courseApi";
import { useToast } from "@/context/ToastContext";
import {
  createBatchId,
  getBatchesForTeacher,
  readBatches,
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

  const [, forceRefresh] = useReducer((value) => value + 1, 0);
  const [form, setForm] = useState(() => ({
    courseId: searchParams.get("courseId") || "",
    batchName: "",
    batchCode: "",
    schedule: "",
    startDate: "",
    capacity: "",
    description: "",
  }));

  const batches = teacherId
    ? getBatchesForTeacher(teacherId)
    : [];

  const selectedCourse = courses.find((course) => course._id === form.courseId);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const newBatch = {
      id: createBatchId(),
      teacherId,
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

    const nextBatches = [...readBatches(), newBatch];
    writeBatches(nextBatches);
    forceRefresh();
    setForm({
      courseId: form.courseId,
      batchName: "",
      batchCode: "",
      schedule: "",
      startDate: "",
      capacity: "",
      description: "",
    });
    showToast("Batch created successfully.", "success");
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
            <h2 className="text-xl font-bold text-foreground">Add batch</h2>
            <p className="text-sm text-muted-foreground">Fill the details manually and save it.</p>
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

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              {selectedCourse ? `Batch will be created for ${selectedCourse.title}.` : "No course selected yet."}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
              Save batch
            </button>
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
                        Code: {batch.batchCode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
