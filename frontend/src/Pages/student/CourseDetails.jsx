import { getCourseById } from "@/apis/course.api";
import { Icon } from "@iconify/react";
import { FileText, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";

const CourseDetails = () => {
  const { id } = useParams();
  const [selectedPayment, setSelectedPayment] = useState("esewa");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(id);
        if (response.success) {
          setCourse(response.data);
        } else {
          console.error("Course fetch failed", response.message);
        }
      } catch (error) {
        console.error("Failed to fetch course", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const faqs = [
    {
      question: "Will I get a certificate after completion?",
      answer: "Absolutely! You will receive a verified certificate from NEX-L.",
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
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-13">
              <h1 className="text-4xl font-extrabold text-primary mb-2">
                {course.title}
              </h1>
              <p className="text-gray-500">
                Master the skills with our comprehensive curriculum.
              </p>
            </div>

            {/* Syllabus Document Section (if available) */}
            {course.syllabus && (
              <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100 shadow-sm">
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
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
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
                              <div
                                key={cIdx}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <PlayCircle
                                    size={18}
                                    className="text-gray-400"
                                  />
                                  <span className="text-gray-700 font-medium">
                                    {content.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400 font-bold uppercase">
                                  {content.type}
                                </span>
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
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
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
            <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-xl border border-gray-50">
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
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedPayment === method.id
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
                <div className="mb-6 flex justify-between items-center py-4 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-extrabold text-primary">
                      Rs. {course.price || 0}
                    </span>
                    <span className="text-gray-400 line-through text-xs">
                      Rs. {((course.price || 0) * 1.5).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                  Pay with {selectedPayment.toUpperCase()}
                  <Icon icon="solar:arrow-right-bold" />
                </button>
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
          className={`transition-transform duration-300 text-gray-400 ${
            isOpen ? "rotate-180" : ""
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
