import { Star, Quote, BookOpen } from "lucide-react";
import { buildCourseInsights, getInitials } from "@/lib/siteInsights";
import { useGetPublicCoursesQuery } from "@/store/slices/siteApi";

export function Testimonials() {
  const { data: courses = [] } = useGetPublicCoursesQuery();
  const insights = buildCourseInsights(courses);
  const highlights = insights.topCourses;
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
  ];

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
            <span className="text-sm text-muted-foreground">Top Rated Courses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Learners Are <span className="text-gradient">Choosing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            These live course highlights are pulled from the current catalog and
            ranked by rating and review count.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.length > 0 ? highlights.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group glass-card rounded-md p-8 hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-md gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: Math.max(1, Math.round(Number(testimonial.rating) || 0)) }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {testimonial.description}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-md bg-gradient-to-r ${colors[index % colors.length]} flex items-center justify-center text-primary-foreground font-semibold`}
                >
                  {getInitials(testimonial.title)}
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    {testimonial.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.instructor} · {testimonial.category}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="md:col-span-3 glass-card rounded-md p-8 text-center text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-primary" />
              No published courses are available yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
