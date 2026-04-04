import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Computer Science Student",
    avatar: "PS",
    content:
      "NEXL has completely transformed how I learn. The AI-powered recommendations helped me discover courses I never knew I needed. The local payment integration makes it so convenient!",
    rating: 5,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Mathematics Professor",
    avatar: "RK",
    content:
      "As an educator, NEXL gives me all the tools I need to create engaging courses. The quiz system and progress tracking features are exceptional. My students love it!",
    rating: 5,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Anjita Gurung",
    role: "Data Science Enthusiast",
    avatar: "AG",
    content:
      "The AI summarization feature is a game-changer! I can quickly review lecture summaries before exams. The platform is intuitive and the community is very supportive.",
    rating: 5,
    color: "from-emerald-500 to-teal-500",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-16 lg:py-32">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-md blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md glass-card mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Our <span className="text-gradient">Users Say</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from students and educators who have transformed their learning
            experience with NEXL.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group glass-card rounded-md p-8 hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-md gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-md bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-primary-foreground font-semibold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
