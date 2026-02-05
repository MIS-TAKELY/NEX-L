import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Navbar from '../../components/common/Navbar';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState('esewa');

    // Mock Data Store (This would ideally come from an API/Context)
    const coursesData = {
        'default': {
            title: "Course Details",
            syllabus: [
                { title: "Introduction", content: "Overview of the course, tools setup, and getting started." },
                { title: "Core Concepts", content: "Deep dive into the fundamental concepts and theory." },
                { title: "Practical Application", content: "Hands-on projects and real-world examples." },
                { title: "Advanced Topics", content: "Optimization, best practices, and advanced techniques." },
            ],
            requirements: [
                 "A laptop, computer, or mobile phone with internet connection",
                 "Dedication and willingness to learn",
            ],
            price: "Rs. 2,000"
        },
        'python-beg': {
            title: "Python for Beginners",
            syllabus: [
                { title: "Introduction to Python", content: "History, installation, VS Code setup, running first script." },
                { title: "Variables & Data Types", content: "Strings, Integers, Floats, Booleans, Type conversion." },
                { title: "Control Flow", content: "If/Else statements, For loops, While loops, Break/Continue." },
                { title: "Functions & Modules", content: "Defining functions, parameters, return values, importing modules." },
                { title: "Data Structures", content: "Lists, Tuples, Sets, Dictionaries and their operations." },
            ],
            requirements: ["No prior coding experience needed", "Laptop with any OS (Windows/Mac/Linux)"],
            price: "Rs. 3,500"
        },
        'mern-stack': {
             title: "MERN Stack Projects",
             syllabus: [
                 { title: "MongoDB", content: "NoSQL basics, Schemas, CRUD operations, Aggregation." },
                 { title: "Express.js", content: "Routing, Middleware, REST API standards, Error handling." },
                 { title: "React.js", content: "Hooks, State Management (Redux/Context), Component lifecycle." },
                 { title: "Node.js", content: "Event loop, File system, Streams, HTTP server." },
                 { title: "Deployment", content: "Deploying to Vercel, Netlify, Render, and CI/CD pipelines." },
             ],
             requirements: ["Basic knowledge of HTML/CSS/JS", "Understanding of synchronous/asynchronous programming"],
             price: "Rs. 5,500"
        }
        // Add more courses as needed
    };

    const course = coursesData[id] || coursesData['default'];

  const faqs = [
    // { question: "Are online codcourses effective for learning programming?", answer: "Yes, our online courses are designed to be interactive and practical." },
    { question: "Do I get certification and career support after completing the course?", answer: "Yes, you will receive a verified certificate and career guidance." },
    // { question: "What kind of support and mentorship will I receive?", answer: "You get 24/7 community support and weekly mentor sessions." },
    { question: "Are the classes recorded for later review?", answer: "Yes, all live sessions are recorded and available in your dashboard." },
  ];

  const paymentMethods = [
      { id: 'esewa', name: 'eSewa Mobile Wallet', icon: 'solar:wallet-money-linear', color: '#60bb46' },
      { id: 'khalti', name: 'Khalti Digital Wallet', icon: 'solar:wallet-2-linear', color: '#5c2d91' },
      { id: 'connectips', name: 'ConnectIPS / Bank', icon: 'solar:card-transfer-linear', color: '#dc1212ff' },
  ];

  const renderPaymentInstructions = () => {
      switch(selectedPayment) {
          case 'esewa':
              return (
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm space-y-3 mb-6">
                      <p className="font-medium text-gray-700">You will be redirected to your eSewa account to complete your payment:</p>
                      <ol className="list-decimal list-inside text-gray-500 space-y-1 ml-1">
                          <li>Login to your eSewa account using your eSewa ID and Password.</li>
                          <li>Ensure your eSewa account is active and has sufficient balance.</li>
                          <li>Enter OTP (one time password) sent to your registered mobile number.</li>
                      </ol>
                  </div>
              );
          case 'khalti':
               return (
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm space-y-3 mb-6">
                      <p className="font-medium text-gray-700">You will be redirected to your Khalti account to complete your payment:</p>
                      <ol className="list-decimal list-inside text-gray-500 space-y-1 ml-1">
                          <li>Login to your Khalti account using your Khalti ID and Pin.</li>
                          <li>Ensure your Khalti account is active and has sufficient balance.</li>
                          <li>Enter OTP (one time password) sent to your registered mobile number.</li>
                      </ol>
                  </div>
              );
          case 'connectips':
              return (
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm space-y-3 mb-6">
                      <p className="font-medium text-gray-700">You will be redirected to ConnectIPS to complete your payment:</p>
                      <ol className="list-decimal list-inside text-gray-500 space-y-1 ml-1">
                          <li>Select your bank and login with your credentials.</li>
                          <li>Verify the transaction details.</li>
                          <li>Enter the OTP sent to your mobile or email.</li>
                      </ol>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 font-sans">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Course Content */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* Header */}
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
                        <Icon icon="solar:arrow-left-linear" /> Back to courses
                    </button>
                    <h1 className="text-4xl font-extrabold text-primary mb-2">{course.title}</h1>
                    <p className="text-gray-500">Master the skills with our comprehensive curriculum.</p>
                </div>

                {/* Course Syllabus Section */}
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'cursive' }}>Course</h2>
                    <span className="bg-accent text-white px-4 py-1 rounded-lg text-xl font-bold">Syllabus</span>
                </div>
                
                <div className="space-y-4">
                    {course.syllabus.map((item, index) => (
                        <AccordionItem key={index} title={item.title} content={item.content} colorClass="text-gray-800" />
                    ))}
                </div>
                </section>

                {/* Requirements Section */}
                <section className="bg-accent/5 rounded-3xl p-8 border border-accent/10">
                    <div className="mb-6">
                    <span className="bg-accent text-white px-4 py-1 rounded-lg text-xl font-bold inline-block shadow-sm">Requirements</span>
                    </div>

                    <ul className="space-y-4">
                    {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center shrink-0">
                            <Icon icon="solar:check-read-linear" className="text-accent" />
                        </div>
                        {req}
                        </li>
                    ))}
                    </ul>
                </section>

                {/* FAQ Section */}
                <section>
                <div className="text-center mb-10">
                    <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-bold mb-4">FAQ</div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Frequently asked <span className="bg-accent text-white px-3 py-1 rounded-lg ml-1">questions</span>
                    </h2>
                    <p className="text-gray-500 mt-3">Get answers to common questions about our courses, learning process, and support.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-4 items-start">
                            <span className={`p-2 rounded-full shrink-0 ${index % 2 === 0 ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                <Icon icon={index % 2 === 0 ? "solar:users-group-rounded-linear" : "solar:chat-round-line-linear"} size={20} />
                            </span>
                            <div className="flex-1">
                                <AccordionItem title={faq.question} content={faq.answer} isFaq={true} />
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
                </section>
            </div>

            {/* Right Column: Payment & Enrollment */}
            <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-6">
                    
                    {/* Payment Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-accent"></div>
                        
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Enroll now</h3>
                        <p className="text-gray-500 text-sm mb-6">Select your preferred payment method.</p>

                        <div className="mb-4">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Select Payment Method</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all h-24 ${
                                            selectedPayment === method.id 
                                            ? 'border-accent bg-accent/5 text-accent shadow-sm' 
                                            : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 text-gray-500'
                                        }`}
                                    >
                                        <div className={`p-1.5 rounded-full ${selectedPayment === method.id ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                                            <Icon icon={method.icon} size={24} className={selectedPayment === method.id ? 'text-accent' : 'text-gray-400'} />
                                        </div>
                                        <span className="text-[10px] font-bold text-center leading-tight">{method.name.replace(' Mobile Wallet', '').replace(' Digital Wallet', '')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Instructions */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPayment}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderPaymentInstructions()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="mb-6 flex justify-between items-center py-4 border-t border-gray-100">
                             <span className="text-gray-500 font-medium">Total Amount</span>
                             <div className="text-right">
                                 <span className="block text-2xl font-extrabold text-primary">{course.price}</span>
                                 <span className="text-gray-400 line-through text-xs">Rs. {(parseInt(course.price.replace(/[^0-9]/g, '')) * 1.5).toLocaleString()}</span>
                             </div>
                        </div>

                        <button 
                            onClick={() => navigate(`/payment-gateway?method=${selectedPayment}`)}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Pay Now <Icon icon="solar:card-send-linear" />
                        </button>
                        
                        <p className="text-center text-[10px] text-gray-400 mt-4">
                            By enrolling, you agree to our Terms & Conditions.
                        </p>
                    </div>

                    {/* Help Card */}
                    <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden">
                        <Icon icon="solar:help-linear" className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32" />
                        <h4 className="text-lg font-bold mb-2">Need Help?</h4>
                        <p className="text-white/80 text-sm mb-4">Call us directly for admission enquiry.</p>
                        <a href="tel:+9779827093876" className="flex items-center gap-2 font-bold bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-colors w-fit">
                            <Icon icon="solar:phone-calling-linear" /> +977 9827093876
                        </a>
                    </div>

                </div>
            </div>

          </div>
      </main>

      <Footer />
    </div>
  );
};

// Reusable Accordion Component
const AccordionItem = ({ title, content, isFaq = false, colorClass = "text-gray-800" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${!isFaq ? 'bg-white border border-gray-100 rounded-xl shadow-sm' : ''} overflow-hidden`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left p-4 ${isFaq ? 'p-0 pb-2' : ''} `}
      >
        <span className={`font-bold text-lg ${colorClass}`}>{title}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-accent"
        >
           <Icon icon="solar:alt-arrow-down-linear" size={20} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`text-gray-600 leading-relaxed ${isFaq ? 'pt-0' : 'p-4 pt-0 border-t border-gray-50'}`}>
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetails;
