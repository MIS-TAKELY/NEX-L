import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Nabina Shrestha',
    role: 'Web Development Student',
    rating: 5,
    text: '"The web development course at NEXL completely transformed my career. The practical projects and clear explanations made complex concepts easy to grasp. I am now working as a junior developer!"',
    date: 'Enrolled: Jan 2025'
  },
  {
    id: 2,
    name: 'Grishma Sitaula',
    role: 'Digital Marketing Student',
    rating: 5,
    text: '"As someone new to digital marketing, NEXL gave me the perfect starting point. The instructors are incredibly supportive, and the course materials are top-notch. Highly recommended!"',
    date: 'Enrolled: March 2025'
  },
  {
    id: 3,
    name: 'Karuna Shrestha',
    role: 'UI/UX Design Student',
    rating: 5,
    text: '"Learning UI/UX design has never been this engaging. The focus on real-world case studies helped me build a strong portfolio even before completing the course. Thank you NEXL!"',
    date: 'Enrolled: Nov 2024'
  },
   {
    id: 4,
    name: 'Gita Shrestha',
    role: 'Python Programming Student',
    rating: 5,
    text: '"I always found programming intimidating, but the Python course here broke everything down perfectly. The assignments really tested my knowledge and built my confidence."',
    date: 'Enrolled: Feb 2025'
  },
  {
    id: 5,
    name: 'Shreya Shrestha',
    role: 'Business Management Student',
    rating: 5,
    text: '"NEXL\'s business class is phenomenal. The case studies and real-world examples really prepare you for the current market. I feel much more confident in my entrepreneurial journey now."',
    date: 'Enrolled: Dec 2024'
  },
  {
    id: 6,
    name: 'Apekxya Limbu',
    role: 'Entrepreneurship Course',
    rating: 4,
    text: '"The business curriculum covers everything from strategy to finance in an easy-to-understand way. The instructors have real industry experience, making the lessons incredibly valuable."',
    date: 'Enrolled: Jan 2025'
  },
  {
    id: 7,
    name: 'Nabin Tamang',
    role: '+2 Science Tuition',
    rating: 5,
    text: '"The +2 tuition at NEXL saved my finals! The teachers explain complex physics and chemistry topics so clearly instead of just making us memorize them. Highly recommended for board exam prep."',
    date: 'Enrolled: Nov 2024'
  },
];

const getInitials = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = Math.ceil(testimonials.length / 3);
  const currentSlide = Math.floor(currentIndex / 3);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 3;
      return nextIndex >= testimonials.length ? prev : nextIndex;
    });
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => Math.max(prev - 3, 0));
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
        const item = testimonials[currentIndex + i];
        if (item) {
            visible.push(item);
        } else {
            // Add Empty placeholders to keep layout consistent at the end
            visible.push({ id: `empty-${i}`, empty: true });
        }
    }
    return visible;
  };

  return (
    <section className="py-20 bg-gray-50 flex justify-center items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#1B3452] mb-4">
            Students <span className="text-[#1B3452]">Feedback</span>
          </h2>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Read what our students have to say about their learning journey with NEXL.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
            
          {/* Previous Button - hidden on small screens */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-0 -ml-4 lg:-ml-12 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-primary transition-colors focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Cards Grid */}
          <div className="flex gap-6 w-full overflow-hidden justify-center transition-all duration-300">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div 
                key={testimonial.id}
                className={`bg-white rounded-2xl p-8 flex flex-col mx-auto w-full max-w-sm flex-shrink-0 transition-all duration-300 ${idx > 0 ? "hidden md:flex" : "flex"} ${idx === 2 ? "lg:flex hidden" : ""} ${testimonial.empty ? "opacity-0 pointer-events-none" : "shadow-sm border border-gray-200 items-center text-center hover:scale-105 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 z-0 hover:z-10"}`}
              >
                {!testimonial.empty && (
                  <>
                    {/* User Info Route */}
                    <div className="flex flex-col items-center mb-6 w-full">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-4 shadow-sm">
                          {getInitials(testimonial.name)}
                        </div>
                        <h3 className="text-xl font-bold text-[#1B3452] whitespace-nowrap">{testimonial.name}</h3>
                        <p className="text-gray-600 font-medium text-sm mb-2 whitespace-nowrap">{testimonial.role}</p>
                        
                        {/* Star Rating */}
                        <div className="flex justify-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                            ))}
                        </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-700 italic flex-grow mb-6 leading-relaxed relative">
                      {testimonial.text}
                    </p>

                    {/* Footer Info */}
                    <p className="text-sm font-semibold text-gray-500 mt-auto">
                      {testimonial.date}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Next Button - hidden on small screens */}
          <button 
            onClick={nextTestimonial}
            className="absolute right-0 -mr-4 lg:-mr-12 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:text-primary transition-colors focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden justify-center items-center gap-4 mt-8 w-full">
             <button 
                onClick={prevTestimonial}
                className="h-12 w-12 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
             >
                 <ChevronLeft size={24} />
             </button>
             
              {/* Pagination Dots */}
            <div className="flex gap-2">
            {[...Array(totalSlides)].map((_, idx) => (
                <button
                key={idx}
                onClick={() => setCurrentIndex(idx * 3)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentSlide === idx ? 'bg-[#1B3452]' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                />
            ))}
            </div>

             <button 
                onClick={nextTestimonial}
                 className="h-12 w-12 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
             >
                 <ChevronRight size={24} />
             </button>
        </div>

        {/* Desktop Pagination Dots */}
        <div className="hidden md:flex justify-center items-center gap-2 mt-10">
          {[...Array(totalSlides)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 3)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === idx ? 'bg-[#1B3452]' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Testimonials;
