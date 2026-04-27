import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetInstructorStudentsQuery } from "@/store/slices/enrollmentApi";
import { useCreateTutoringSessionMutation } from "@/store/slices/tutoringSessionApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import ConsultationModal from "@/components/meeting/ConsultationModal";

import TableSkeleton from "@/components/skeletons/TableSkeleton";

const StudentsEnrolled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterCourseId = searchParams.get("courseId");
  
  const [activeSessionId, setActiveSessionId] = useState(null);

  const { userData } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetInstructorStudentsQuery(userData?.id, {
    skip: !userData?.id
  });
  
  const [createSession, { isLoading: isCreating }] = useCreateTutoringSessionMutation();

  const allStudents = data?.students || [];
  const students = filterCourseId 
    ? allStudents.filter(s => s.courseId === filterCourseId)
    : allStudents;

  const handleConsult = async (student) => {
    try {
      const response = await createSession({
        studentId: student.studentId,
        courseId: student.courseId,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour session
        notes: `Consultation with ${student.name}`
      }).unwrap();
      
      if (response.success) {
        setActiveSessionId(response.session._id);
      }
    } catch (err) {
      console.error("Failed to create tutoring session:", err);
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={8} columns={5} />;
  }

  return (
    <div className="font-outfit">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Students Enrolled</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and consult with your students</p>
        </div>
      </div>

      <div className="bg-background rounded-md shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-5">Student</th>
                <th className="text-left px-6 py-5">Course</th>
                <th className="text-center px-6 py-5">Progress</th>
                <th className="text-center px-6 py-5">Enrolled Date</th>
                <th className="text-right px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm text-foreground">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-tight">{student.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{student.course}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                        <div className="w-full bg-secondary/50 rounded-md h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-md shadow-[0_0_8px_rgba(var(--primary),0.3)]" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{student.progress}% Complete</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {new Date(student.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleConsult(student)}
                        disabled={isCreating}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Icon icon="solar:videocamera-record-bold-duotone" className="w-4 h-4" />
                        Consult
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConsultationModal 
        sessionId={activeSessionId} 
        onClose={() => setActiveSessionId(null)} 
        isInstructor={true}
      />
    </div>
  );
};

export default StudentsEnrolled;
