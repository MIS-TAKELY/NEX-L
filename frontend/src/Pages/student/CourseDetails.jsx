import { Icon } from "@iconify/react";
import { FileText, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery, useRecordCourseViewMutation } from "@/store/slices/courseApi";
import { useGetCourseLiveClassesQuery } from "@/store/slices/liveClassApi";
import { useAddToCartMutation, useGetCartQuery, useRemoveFromCartMutation } from "@/store/slices/cartApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { validateCoupon } from "../../apis/coupon.api";
import { useToast } from "../../context/ToastContext";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import {
  getBatchesForCourse,
  getBatchAssignmentMode,
  getBatchAssignedStudentCount,
  isStudentAssignedToBatch,
} from "@/lib/batches";

// Removed Google Docs Viewer as it is flaky with Cloudinary URLs and often shows "No preview available"

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userRole, userData } = useSelector((state) => state.auth);
  const { data: courseResp, isLoading: loading } = useGetCourseByIdQuery(id);
  const { data: cartResp } = useGetCartQuery(undefined, { skip: !isLoggedIn || userRole !== 'student' });
  const [addToCartApi] = useAddToCartMutation();
  const [removeFromCartApi] = useRemoveFromCartMutation();
  const [recordCourseView] = useRecordCourseViewMutation();
  const { data: liveClasses = [] } = useGetCourseLiveClassesQuery(id, { 
    skip: !id,
    pollingInterval: 10000 // Poll every 10s to catch live status
  });
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (isLoggedIn && userRole === 'student' && id && userData?._id) {
      recordCourseView({ courseId: id, userId: userData._id });
    }
  }, [id, isLoggedIn, userRole, userData?._id, recordCourseView]);

  const course = courseResp?.data;
  const courseBatches = getBatchesForCourse(id);
  const assignedBatches =
    isLoggedIn && userRole === "student"
      ? courseBatches.filter((batch) => isStudentAssignedToBatch(batch, userData))
      : [];

  useEffect(() => {
    if (course) {
      setFinalPrice(course.price || 0);
    }
  }, [course]);
  const cartItems = cartResp?.data?.items || [];
  const isInCart = cartItems.some((item) => item.course._id === id);

  const handleAddToCart = async () => {
    try {
      await addToCartApi({ courseId: id, course }).unwrap();
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      await removeFromCartApi(id).unwrap();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsVerifying(true);
    try {
      const result = await validateCoupon(couponCode, id);
      if (result.valid) {
        setAppliedCoupon({ ...result, code: couponCode });
        let discount = 0;
        if (result.type === "percentage") {
          discount = (course.price * result.discount) / 100;
        } else {
          discount = result.discount;
        }
        setDiscountAmount(discount);
        setFinalPrice(course.price - discount);
        showToast("Coupon applied!", "success");
      } else {
        showToast(result.message || "Invalid coupon", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to validate coupon", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const faqs = [
    
    {
      question: "Is there any support if I get stuck?",
      answer:
        "We have a dedicated community and mentor support to help you out.",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-outfit">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-outfit">
        Course not found
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen font-outfit text-foreground bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="gradient-mesh fixed inset-0 pointer-events-none opacity-60" />
      
      <Navbar />

      <main className="flex-1 relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Course Details & Syllabus */}
            <div className="lg:col-span-2 space-y-12">
              <div className="glass premium-card rounded-md p-8 border border-border/50">
                <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight mb-3">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Master the skills with our comprehensive curriculum.
                </p>
              </div>

              {assignedBatches.length > 0 && isLoggedIn && userRole === "student" && (
                <section className="glass premium-card rounded-md p-6 md:p-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-card shadow-xl shadow-emerald-500/10 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-md blur-3xl" />
                    <div className="absolute -bottom-12 -left-8 w-28 h-28 bg-primary/5 rounded-md blur-3xl" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-md bg-background/80 backdrop-blur flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg">
                        <Icon icon="solar:verified-check-bold-duotone" size={28} />
                      </div>
                      <div className="max-w-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600 mb-2">
                          You are in this course cohort
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground serif leading-tight">
                          Batch membership is active for this course
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground mt-2">
                          Your instructor assigned you to {assignedBatches.length} batch{assignedBatches.length === 1 ? "" : "es"} here. The membership badge is shown instantly across your dashboard.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {assignedBatches.slice(0, 2).map((batch) => (
                            <span
                              key={batch.id}
                              className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                            >
                              <span className="text-base">{batch.batchName?.charAt(0)?.toUpperCase() || "B"}</span>
                              {batch.batchName}
                            </span>
                          ))}
                          {assignedBatches.length > 2 && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                              +{assignedBatches.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                      <button
                        onClick={() => navigate("/student/badges")}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-opacity"
                      >
                        <Icon icon="solar:medal-ribbons-star-bold" size={18} />
                        View badge card
                      </button>
                      <button
                        onClick={() => navigate("/student/dashboard")}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-background/80 px-5 py-3 text-sm font-bold text-foreground hover:bg-background transition-colors"
                      >
                        <Icon icon="solar:widget-2-bold" size={18} />
                        Open dashboard
                      </button>
                    </div>
                  </div>
                </section>
              )}

            {/* Demo / Preview Video Section */}
            {course.demoVideo && (
              <section className="glass premium-card rounded-md overflow-hidden border border-border/50">
                <div className="relative aspect-video bg-black/50">
                  <video
                    src={course.demoVideo}
                    controls
                    className="w-full h-full object-contain"
                    poster={course.thumbnail || undefined}
                  />
                  <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-md text-[10px] font-bold text-primary uppercase tracking-widest shadow-lg border border-white/10 flex items-center gap-1.5">
                    <PlayCircle size={14} />
                    Free Preview
                  </span>
                </div>
                <div className="px-6 py-4 border-t border-border/50 bg-card/50">
                  <p className="text-sm text-muted-foreground font-medium">
                    Watch this free preview before enrolling — get a feel for the teaching style and course content.
                  </p>
                </div>
              </section>
            )}

            {/* Syllabus Document Section (if available) */}
            {course.syllabus && (
              <section className="glass premium-card rounded-md p-8 border border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Course Syllabus</h2>
                        <p className="text-sm text-muted-foreground">Detailed curriculum overview and learning path.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a
                        href={course.syllabus}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-primary/30 hover:border-primary text-primary px-5 py-2.5 rounded-md font-bold transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <Icon icon="solar:eye-bold" />
                        Open PDF
                      </a>
                      <a
                        href={course.syllabus}
                        download
                        className="bg-primary hover:bg-primary-hover text-primary-foreground px-5 py-2.5 rounded-md font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        <Icon icon="solar:download-minimalistic-bold" />
                        Download
                      </a>
                    </div>
                  </div>
                  {/* Native PDF preview */}
                  <div className="rounded-md overflow-hidden border border-border/50 bg-muted/10 relative" style={{ height: '520px' }}>
                    <object
                      data={course.syllabus}
                      type="application/pdf"
                      className="w-full h-full absolute inset-0 z-10"
                    >
                      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center bg-card">
                        <FileText size={48} className="text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">Your browser doesn't support native PDF preview.</p>
                        <a href={course.syllabus} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">
                          Click here to download or view the PDF
                        </a>
                      </div>
                    </object>
                  </div>
                </div>
              </section>
            )}

            {/* Live Class Schedule Section */}
            {liveClasses.length > 0 && (
              <section className="glass premium-card rounded-md p-8 border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">
                    <div className="w-1.5 h-1.5 bg-card rounded-md" /> LIVE SESSIONS
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-md bg-red-500/10 flex items-center justify-center">
                    <Icon icon="solar:videocamera-record-bold-duotone" className="text-red-500 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Live Class Schedule</h2>
                </div>
                <div className="space-y-4">
                  {liveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-md bg-card/50 border border-border/50 hover:border-red-500/30 transition-all group gap-4">
                      <div className="flex items-start gap-4">
                        <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-md bg-background border border-border/50">
                          <span className="text-[10px] font-bold text-red-500 uppercase">{dayjs(liveClass.startTime).format('MMM')}</span>
                          <span className="text-2xl font-black text-foreground">{dayjs(liveClass.startTime).format('D')}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-red-500 transition-colors">{liveClass.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <Icon icon="solar:clock-circle-bold" className="text-primary" />
                              {dayjs(liveClass.startTime).format('h:mm A')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon icon="solar:stopwatch-bold" className="text-primary" />
                              {liveClass.duration} min
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Icon icon="solar:user-bold" className="text-primary" />
                              by Trainer
                            </span>
                          </div>
                        </div>
                      </div>
                      {liveClass.status === 'live' && (
                        <button
                          onClick={() => navigate(`/student/live/${id}`)}
                          className="px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-md hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                          <Icon icon="solar:play-bold" />
                          Join Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Batch Assignments Section */}
            {assignedBatches.length > 0 && isLoggedIn && userRole === "student" && (
              <section className="glass premium-card rounded-md p-8 border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Icon icon="solar:verified-check-bold-duotone" className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Your assigned batch</h2>
                    <p className="text-sm text-muted-foreground">
                      These batches already include your student account.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {assignedBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-md border border-emerald-500/20 bg-background/70 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">{batch.batchName}</h3>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                              {getBatchAssignmentMode(batch).charAt(0).toUpperCase() +
                                getBatchAssignmentMode(batch).slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Code:{" "}
                            <span className="font-semibold text-foreground">{batch.batchCode}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to:{" "}
                            <span className="font-semibold text-foreground">
                              {batch.assignedTeacher || "Current Teacher"}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground w-full md:w-auto">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Students
                            </p>
                            <p>{getBatchAssignedStudentCount(batch)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Start
                            </p>
                            <p>{batch.startDate || "TBA"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {courseBatches.length > 0 && (
              <section className="glass premium-card rounded-md p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon
                      icon="solar:layers-minimalistic-bold-duotone"
                      className="text-primary w-6 h-6"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Available Batches</h2>
                    <p className="text-sm text-muted-foreground">
                      Batches created by the instructor for this course.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {courseBatches.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-md border border-border/50 bg-card/50 p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
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
                          <p className="text-sm text-muted-foreground">
                            Code:{" "}
                            <span className="font-semibold text-foreground">{batch.batchCode}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to:{" "}
                            <span className="font-semibold text-foreground">
                              {batch.assignedTeacher || "Current Teacher"}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assignment:{" "}
                            <span className="font-semibold text-foreground">
                              {getBatchAssignmentMode(batch).charAt(0).toUpperCase() +
                                getBatchAssignmentMode(batch).slice(1)}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Students:{" "}
                            <span className="font-semibold text-foreground">
                              {getBatchAssignedStudentCount(batch)}
                            </span>
                          </p>
                          {batch.description ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {batch.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground w-full md:w-auto">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Start
                            </p>
                            <p>{batch.startDate || "TBA"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Capacity
                            </p>
                            <p>{batch.capacity || "Unlimited"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                              Schedule
                            </p>
                            <p>{batch.schedule || "TBA"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course Curriculum Section */}
            {course.sections && course.sections.length > 0 && (
              <section className="glass premium-card rounded-md p-8 border border-border/50">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-3xl md:text-4xl font-black text-foreground">
                    Course <span className="text-gradient italic">Curriculum</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {course.sections.map((section, index) => (
                    <AccordionItem
                      key={index}
                      title={section.title}
                      content={
                        <div className="space-y-3">
                          {section.contents &&
                            section.contents.map((content, cIdx) => (
                              <div key={cIdx} className="space-y-2">
                                <div className="flex items-center gap-3 px-3 py-1 mt-2">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">LESSON {cIdx + 1}</span>
                                  <span className="text-foreground font-bold text-sm truncate">{content.title}</span>
                                </div>

                                {content.resources && content.resources.map((resource, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-all border border-transparent hover:border-primary/20 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      {resource.type === 'video' ? (
                                        <PlayCircle size={18} className="text-primary" />
                                      ) : resource.type === 'pdf' || resource.type === 'document' ? (
                                        <FileText size={18} className="text-accent" />
                                      ) : resource.type === 'image' ? (
                                        <Icon icon="solar:gallery-bold" className="text-green-500" width={18} />
                                      ) : (
                                        <Icon icon="solar:document-bold" className="text-muted-foreground" width={18} />
                                      )}
                                      <span className="text-foreground/80 font-medium text-sm">
                                        {resource.name || `Resource ${rIdx + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {resource.duration > 0 && (
                                        <span className="text-[10px] text-muted-foreground font-medium">
                                          {Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-muted-foreground font-bold uppercase bg-background px-2 py-0.5 rounded border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        {resource.type}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      }
                      colorClass="text-foreground"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Description Section */}
            <section className="glass premium-card rounded-md p-8 border border-border/50">
              <h2 className="text-3xl font-black text-foreground mb-4">
                Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {course.description}
              </p>
            </section>

            {/* FAQ Section */}
            <section className="glass premium-card rounded-md p-8 border border-border/50">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-foreground">
                  Frequently <span className="text-gradient italic">Asked Questions</span>
                </h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    title={faq.question}
                    content={faq.answer}
                    colorClass="text-foreground"
                  />
                ))}
              </div>
            </section>

            {/* Reviews & Ratings Section */}
            <section className="glass premium-card rounded-md p-8 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Icon icon="solar:star-bold-duotone" className="text-amber-500 w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground">
                      Reviews & <span className="text-gradient italic">Ratings</span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      What students are saying about this course
                    </p>
                  </div>
                </div>

                {/* Rating Summary Badge */}
                <div className="flex items-center gap-3 bg-amber-500/10 px-5 py-3 rounded-md border border-amber-500/20">
                  <span className="text-3xl font-black text-amber-500">{course.ratings?.average || 0}</span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          icon={star <= Math.round(course.ratings?.average || 0) ? "solar:star-bold" : "solar:star-linear"}
                          className={`w-3.5 h-3.5 ${star <= Math.round(course.ratings?.average || 0) ? "text-amber-500" : "text-muted-foreground/40"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {course.ratings?.count || 0} review{course.ratings?.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {course.reviews && course.reviews.length > 0 ? (
                <div className="space-y-5">
                  {course.reviews.map((review, index) => (
                    <div
                      key={review._id || index}
                      className="p-5 rounded-md bg-card/50 border border-border/50 hover:border-amber-500/20 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                          {review.user?.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                              {(review.user?.name || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1.5">
                            <h4 className="font-bold text-foreground text-sm truncate">
                              {review.user?.name || "Anonymous"}
                            </h4>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Icon
                                  key={star}
                                  icon={star <= review.rating ? "solar:star-bold" : "solar:star-linear"}
                                  className={`w-3.5 h-3.5 ${star <= review.rating ? "text-amber-500" : "text-muted-foreground/20"}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium ml-auto">
                              {dayjs(review.createdAt).format('MMM D, YYYY')}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-md bg-muted/30 flex items-center justify-center mx-auto mb-5">
                    <Icon icon="solar:chat-round-line-bold-duotone" className="text-muted-foreground w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Be the first to share your experience and help others choose the right course.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Enrollment / Payment Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 glass premium-card rounded-md p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-foreground mb-2">
                  Enroll Now
                </h3>
                <p className="text-muted-foreground text-sm">
                  Join thousands of students and start your journey today!
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
                  Payment Method
                </label>
                <div className="flex items-center justify-between gap-3 p-4 rounded-md border-2 border-primary bg-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/80 dark:bg-zinc-900/80">
                      <img src="/esewa.webp" alt="eSewa" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">eSewa</p>
                    </div>
                  </div>
                  <Icon icon="solar:check-circle-bold-duotone" className="text-primary text-2xl" />
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course Fee</span>
                  <span className="text-foreground font-semibold">
                    Rs. {course.price || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span className="text-muted-foreground/50">Rs. 0</span>
                </div>
                {/* Coupon Section */}
                <div className="py-4 border-t border-border/50 mt-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
                    Have a coupon?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 rounded-md border border-border bg-background/50 text-sm outline-none focus:border-primary font-bold uppercase transition-colors"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isVerifying || !couponCode}
                        className="bg-primary/10 text-primary px-5 py-3 rounded-md font-bold text-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {isVerifying ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-md border border-green-500/20">
                      <span className="text-xs font-bold text-green-500 inline-flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" />
                        {appliedCoupon.code} Applied
                      </span>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setDiscountAmount(0);
                          setFinalPrice(course.price);
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-500 hover:underline uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6 flex justify-between items-center py-4 border-t border-border/50">
                  <span className="text-muted-foreground font-medium">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-primary">
                      Rs. {finalPrice || 0}
                    </span>
                    {discountAmount > 0 ? (
                      <span className="text-green-500 font-bold text-[10px] uppercase tracking-wider mt-1 block">
                        Saved Rs. {discountAmount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 line-through text-xs mt-1 block">
                        Rs. {((course.price || 0) * 1.5).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/payment-gateway?method=esewa&amount=${finalPrice}&courseId=${id}${appliedCoupon ? `&couponCode=${appliedCoupon.code}` : ""}`)}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-md font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  Pay with eSewa
                  <Icon icon="solar:arrow-right-bold" className="group-hover:translate-x-1 transition-transform" />
                </button>

                {userRole === "student" && (
                  <button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    className={`w-full py-4 rounded-md font-bold text-lg transition-all border-2 flex items-center justify-center gap-3 mt-3 group
                      ${isInCart
                        ? "bg-destructive/10 border-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                        : "bg-transparent border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/50"
                      }`}
                  >
                    {isInCart ? (
                      <>
                        <Icon icon="solar:trash-bin-trash-bold" />
                        Remove from Cart
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:cart-plus-bold" className="group-hover:scale-110 transition-transform" />
                        Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                {[
                  { icon: "solar:document-bold", text: "Course Resources" },
                  
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 text-muted-foreground text-sm font-medium"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon
                        icon={feature.icon}
                        className="text-primary text-sm"
                      />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Accordion Component
const AccordionItem = ({ title, content, colorClass }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card/50 rounded-md border border-border/50 overflow-hidden transition-colors hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors hover:bg-muted/30"
      >
        <span className={`font-bold text-lg ${colorClass || "text-foreground"}`}>{title}</span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon
            icon="solar:alt-arrow-down-bold"
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2">
          <div className="text-muted-foreground leading-relaxed font-medium">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
