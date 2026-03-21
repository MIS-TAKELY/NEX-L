import { Icon } from "@iconify/react";
import { FileText, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery, useRecordCourseViewMutation } from "@/store/slices/courseApi";
import { useGetCourseLiveClassesQuery } from "@/store/slices/liveClassApi";
import { useAddToCartMutation, useGetCartQuery, useRemoveFromCartMutation } from "@/store/slices/cartApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { validateCoupon } from "../../apis/coupon.api";
import { useToast } from "../../context/ToastContext";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userRole, userData } = useSelector((state) => state.auth);
  const [selectedPayment, setSelectedPayment] = useState("esewa");
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
      question: "Will I get a certificate after completion?",
      answer: "Absolutely! You will receive a verified certificate from NEXL.",
    },
    {
      question: "Can I access the course material anytime?",
      answer: "Yes, you get lifetime access to all course resources.",
    },
    {
      question: "Is there any support if I get stuck?",
      answer:
        "We have a dedicated community and mentor support to help you out.",
    },
  ];

  const paymentMethods = [
    { id: "esewa", name: "eSewa", icon: "logos:esewa" },
    { id: "khalti", name: "Khalti", icon: "logos:khalti" },
    { id: "fonepay", name: "Fonepay", icon: "logos:fonepay" },
    { id: "imepay", name: "IME Pay", icon: "logos:imepay" },
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
              <div className="glass premium-card rounded-2xl p-8 border border-border/50">
                <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight mb-3">
                  {course.title}
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Master the skills with our comprehensive curriculum.
                </p>
              </div>

            {/* Demo / Preview Video Section */}
            {course.demoVideo && (
              <section className="glass premium-card rounded-2xl overflow-hidden border border-border/50">
                <div className="relative aspect-video bg-black/50">
                  <video
                    src={course.demoVideo}
                    controls
                    className="w-full h-full object-contain"
                    poster={course.thumbnail || undefined}
                  />
                  <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest shadow-lg border border-white/10 flex items-center gap-1.5">
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
              <section className="glass premium-card rounded-2xl p-8 border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="text-primary w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Course Syllabus
                      </h2>
                    </div>
                    <a
                      href={course.syllabus}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                    >
                      Download PDF{" "}
                      <Icon icon="solar:download-minimalistic-bold" className="group-hover/btn:translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                  <p className="text-muted-foreground md:ml-15">
                    Detailed curriculum overview and learning path available for
                    download.
                  </p>
                </div>
              </section>
            )}

            {/* Live Class Schedule Section */}
            {liveClasses.length > 0 && (
              <section className="glass premium-card rounded-2xl p-8 border border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE SESSIONS
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Icon icon="solar:videocamera-record-bold-duotone" className="text-red-500 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Live Class Schedule</h2>
                </div>
                <div className="space-y-4">
                  {liveClasses.map((liveClass) => (
                    <div key={liveClass._id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-red-500/30 transition-all group gap-4">
                      <div className="flex items-start gap-4">
                        <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-background border border-border/50">
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
                          className="px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
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

            {/* Course Curriculum Section */}
            {course.sections && course.sections.length > 0 && (
              <section className="glass premium-card rounded-2xl p-8 border border-border/50">
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
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-primary/20 group"
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
            <section className="glass premium-card rounded-2xl p-8 border border-border/50">
              <h2 className="text-3xl font-black text-foreground mb-4">
                Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {course.description}
              </p>
            </section>

            {/* FAQ Section */}
            <section className="glass premium-card rounded-2xl p-8 border border-border/50">
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
          </div>

          {/* Right Column - Enrollment / Payment Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 glass premium-card rounded-2xl p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-foreground mb-2">
                  Enroll Now
                </h3>
                <p className="text-muted-foreground text-sm">
                  Join thousands of students and start your journey today!
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedPayment === method.id
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "border-border/50 hover:border-border bg-card/50"
                        }`}
                    >
                      <Icon icon={method.icon} className="text-2xl" />
                      <span className="text-xs font-bold text-foreground">{method.name}</span>
                    </button>
                  ))}
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
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-background/50 text-sm outline-none focus:border-primary font-bold uppercase transition-colors"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isVerifying || !couponCode}
                        className="bg-primary/10 text-primary px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {isVerifying ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-xl border border-green-500/20">
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
                  onClick={() => navigate(`/payment-gateway?method=${selectedPayment}&amount=${finalPrice}&courseId=${id}${appliedCoupon ? `&couponCode=${appliedCoupon.code}` : ""}`)}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  Pay with {selectedPayment.toUpperCase()}
                  <Icon icon="solar:arrow-right-bold" className="group-hover:translate-x-1 transition-transform" />
                </button>

                {userRole === "student" && (
                  <button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-center gap-3 mt-3 group
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
                  { icon: "solar:play-bold", text: "Lifetime Access" },
                  { icon: "solar:document-bold", text: "Course Resources" },
                  {
                    icon: "solar:medal-bold",
                    text: "Certificate on Completion",
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 text-muted-foreground text-sm font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
    <div className="bg-card/50 rounded-2xl border border-border/50 overflow-hidden transition-colors hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors hover:bg-muted/30"
      >
        <span className={`font-bold text-lg ${colorClass || "text-foreground"}`}>{title}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon
            icon="solar:alt-arrow-down-bold"
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 pt-2">
              <div className="text-muted-foreground leading-relaxed font-medium">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetails;
