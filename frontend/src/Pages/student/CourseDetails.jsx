import { Icon } from "@iconify/react";
import { FileText, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCourseByIdQuery, useRecordCourseViewMutation } from "@/store/slices/courseApi";
import { useAddToCartMutation, useGetCartQuery, useRemoveFromCartMutation } from "@/store/slices/cartApi";
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
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Course not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Course Details & Syllabus */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-13">
              <h1 className="text-4xl font-extrabold text-primary mb-2">
                {course.title}
              </h1>
              <p className="text-gray-500">
                Master the skills with our comprehensive curriculum.
              </p>
            </div>

            {/* Demo / Preview Video Section */}
            {course.demoVideo && (
              <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative aspect-video bg-black">
                  <video
                    src={course.demoVideo}
                    controls
                    className="w-full h-full object-contain"
                    poster={course.thumbnail || undefined}
                  />
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <PlayCircle size={14} />
                    Free Preview
                  </span>
                </div>
                <div className="px-6 py-4 border-t border-gray-50">
                  <p className="text-sm text-gray-500 font-medium">
                    Watch this free preview before enrolling — get a feel for the teaching style and course content.
                  </p>
                </div>
              </section>
            )}

            {/* Syllabus Document Section (if available) */}
            {course.syllabus && (
              <section className="bg-blue-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={32} />
                    <h2 className="text-2xl font-bold text-blue-900">
                      Course Syllabus
                    </h2>
                  </div>
                  <a
                    href={course.syllabus}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Download PDF{" "}
                    <Icon icon="solar:download-minimalistic-bold" />
                  </a>
                </div>
                <p className="text-blue-700">
                  Detailed curriculum overview and learning path available for
                  download.
                </p>
              </section>
            )}

            {/* Course Curriculum Section */}
            {course.sections && course.sections.length > 0 && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <h2
                    className="text-3xl font-bold text-gray-800"
                    style={{ fontFamily: "cursive" }}
                  >
                    Course
                  </h2>
                  <span className="bg-accent text-white px-4 py-1 rounded-lg text-xl font-bold">
                    Curriculum
                  </span>
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
                                  <span className="text-xs font-bold text-gray-300">LESSON {cIdx + 1}</span>
                                  <span className="text-gray-800 font-bold text-sm truncate">{content.title}</span>
                                </div>

                                {content.resources && content.resources.map((resource, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-blue-100 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      {resource.type === 'video' ? (
                                        <PlayCircle size={18} className="text-blue-500" />
                                      ) : resource.type === 'pdf' || resource.type === 'document' ? (
                                        <FileText size={18} className="text-red-500" />
                                      ) : resource.type === 'image' ? (
                                        <Icon icon="solar:gallery-bold" className="text-green-500" width={18} />
                                      ) : (
                                        <Icon icon="solar:document-bold" className="text-gray-400" width={18} />
                                      )}
                                      <span className="text-gray-700 font-medium text-sm">
                                        {resource.name || `Resource ${rIdx + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {resource.duration > 0 && (
                                        <span className="text-[10px] text-gray-400 font-medium">
                                          {Math.floor(resource.duration / 60)}:{(resource.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400 font-bold uppercase bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        {resource.type}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      }
                      colorClass="text-gray-800"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Description Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </section>

            {/* FAQ Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2
                  className="text-3xl font-bold text-gray-800"
                  style={{ fontFamily: "cursive" }}
                >
                  Frequently
                </h2>
                <span className="bg-primary text-white px-4 py-1 rounded-lg text-xl font-bold">
                  Asked Questions
                </span>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    title={faq.question}
                    content={faq.answer}
                    colorClass="text-primary"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Enrollment / Payment Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-8 shadow-xl border border-gray-50">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Enroll Now
                </h3>
                <p className="text-gray-500 text-sm">
                  Join thousands of students and start your journey today!
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
                <label className="text-sm font-semibold text-gray-700 block mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedPayment === method.id
                        ? "border-primary bg-primary/5 shadow-inner"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <Icon icon={method.icon} className="text-2xl" />
                      <span className="text-xs font-bold">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Course Fee</span>
                  <span className="text-gray-800 font-semibold">
                    Rs. {course.price || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Charge</span>
                  <span className="text-gray-400">Rs. 0</span>
                </div>
                {/* Coupon Section */}
                <div className="py-4 border-t border-gray-100 mt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Have a coupon?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary font-bold uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isVerifying || !couponCode}
                        className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                      >
                        {isVerifying ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-50 p-2 rounded-xl border border-green-100">
                      <span className="text-xs font-bold text-green-700">
                        {appliedCoupon.code} Applied
                      </span>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setDiscountAmount(0);
                          setFinalPrice(course.price);
                        }}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6 flex justify-between items-center py-4 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-extrabold text-primary">
                      Rs. {finalPrice || 0}
                    </span>
                    {discountAmount > 0 ? (
                      <span className="text-green-600 font-bold text-[10px]">
                        Saved Rs. {discountAmount}
                      </span>
                    ) : (
                      <span className="text-gray-400 line-through text-xs">
                        Rs. {((course.price || 0) * 1.5).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/payment-gateway?method=${selectedPayment}&amount=${finalPrice}&courseId=${id}${appliedCoupon ? `&couponCode=${appliedCoupon.code}` : ""}`)}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  Pay with {selectedPayment.toUpperCase()}
                  <Icon icon="solar:arrow-right-bold" />
                </button>

                {userRole === "student" && (
                  <button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-center gap-3 mt-3
                      ${isInCart
                        ? "bg-white border-red-500 text-red-500 hover:bg-red-50"
                        : "bg-white border-primary text-primary hover:bg-primary/5"
                      }`}
                  >
                    {isInCart ? (
                      <>
                        <Icon icon="solar:trash-bin-trash-bold" />
                        Remove from Cart
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:cart-plus-bold" />
                        Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
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
                    className="flex items-center gap-3 text-gray-600 text-sm"
                  >
                    <Icon
                      icon={feature.icon}
                      className="text-primary text-lg"
                    />
                    <span>{feature.text}</span>
                  </div>
                ))}
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
    <div className="bg-[#F8FAFC] rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between transition-colors hover:bg-gray-50"
      >
        <span className={`font-bold text-lg ${colorClass}`}>{title}</span>
        <Icon
          icon="solar:alt-arrow-down-bold"
          className={`transition-transform duration-300 text-gray-400 ${isOpen ? "rotate-180" : ""
            }`}
        />
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
              <p className="text-gray-600 leading-relaxed font-medium">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetails;
