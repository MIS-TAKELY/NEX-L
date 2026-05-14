import { useReducer, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { readBatches, writeBatches } from "@/lib/batches";

const AdminBatches = () => {
  const navigate = useNavigate();
  const [, forceRefresh] = useReducer((value) => value + 1, 0);
  const [query, setQuery] = useState("");
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [assignedTeacher, setAssignedTeacher] = useState("");

  const batches = readBatches();
  const teacherOptions = (() => {
    const values = new Set();
    batches.forEach((batch) => {
      if (batch.assignedTeacher) values.add(batch.assignedTeacher);
    });
    return [...values].sort();
  })();

  const filteredBatches = batches.filter((batch) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return [
      batch.batchName,
      batch.batchCode,
      batch.courseTitle,
      batch.assignedTeacher,
      batch.teacherId,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });

  const startEdit = (batch) => {
    setEditingBatchId(batch.id);
    setSelectedTeacher(batch.teacherId || "");
    setAssignedTeacher(batch.assignedTeacher || "");
  };

  const saveEdit = () => {
    const nextBatches = readBatches().map((batch) =>
      batch.id === editingBatchId
        ? {
            ...batch,
            teacherId: selectedTeacher.trim() || batch.teacherId,
            assignedTeacher: assignedTeacher.trim() || batch.assignedTeacher || "Current Teacher",
          }
        : batch
    );

    writeBatches(nextBatches);
    forceRefresh();
    setEditingBatchId(null);
    setSelectedTeacher("");
    setAssignedTeacher("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Batch Admin
          </p>
          <h1 className="text-2xl font-black text-foreground">Manage all batches</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Reassign batches to another teacher manually and keep all batch records in one place.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/users")}
          className="w-fit rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Back to users
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search batches by name, code, course, or teacher"
          className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {filteredBatches.length} batch{filteredBatches.length === 1 ? "" : "es"}
        </div>
      </div>

      {editingBatchId ? (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Teacher ID
              </span>
              <input
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                placeholder="teacher id or name"
                list="teacher-options"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assigned teacher
              </span>
              <input
                value={assignedTeacher}
                onChange={(e) => setAssignedTeacher(e.target.value)}
                placeholder="teacher name or email"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={saveEdit}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Save changes
            </button>
            <button
              onClick={() => setEditingBatchId(null)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>

          <datalist id="teacher-options">
            {teacherOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>

          <p className="mt-3 text-xs text-muted-foreground">
            Without a teacher API, this saves the teacher label manually.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No batches found.
          </div>
        ) : (
          filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="rounded-md border border-border bg-card p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{batch.batchName}</h3>
                  <span className="rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground">
                    {batch.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{batch.courseTitle}</p>
                <p className="text-xs text-muted-foreground">
                  Teacher ID: <span className="font-semibold text-foreground">{batch.teacherId || "N/A"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Assigned to: <span className="font-semibold text-foreground">{batch.assignedTeacher || "Current Teacher"}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Assignment: <span className="font-semibold text-foreground">
                    {batch.assignmentMode === "automatic"
                      ? "Automatic"
                      : batch.assignmentMode === "manual"
                        ? "Manual"
                        : "Open"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Students: <span className="font-semibold text-foreground">{(batch.assignedStudents || []).length}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Code: <span className="font-semibold text-foreground">{batch.batchCode}</span>
                </p>
              </div>

              <button
                onClick={() => startEdit(batch)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <Icon icon="solar:pen-bold-duotone" className="h-4 w-4" />
                Reassign
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBatches;
