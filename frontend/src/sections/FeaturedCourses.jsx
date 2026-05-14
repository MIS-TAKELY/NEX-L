import { ArrowRight, Star, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { useGetPublicCoursesQuery } from "@/store/slices/siteApi";
import { buildCourseInsights, compactNumber, getInitials } from "@/lib/siteInsights";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function FeaturedCourses() {
  const { data: courses = [] } = useGetPublicCoursesQuery();
  const insights = buildCourseInsights(courses);
  const featured = insights.topCourses.length > 0 ? insights.topCourses : courses.slice(0, 4);

  return (
    <section id="courses" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Featured <span className="text-primary">Courses</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explore live courses from the current catalog, ranked by rating and review volume.
            </p>
          </div>
          <a
            href="/course-list"
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors group"
          >
            View all courses
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featured.map((course, index) => {
            const teacherName =
              course.instructor ||
              course.teacher?.name ||
              "NEXL Instructor";
            const rating = Number(course.rating || course?.ratings?.average || 0);
            const progress = Math.max(20, Math.min(100, Math.round(rating * 20)));
            const totalStudents = compactNumber(
              Number(course?.enrollments?.length || 0) || index + 1,
            );

            return (
              <motion.div
                key={course.id || course._id || course.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-card rounded-md overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={course.image || course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-primary font-medium"
                  >
                    {course.category || "General"}
                  </Badge>
                  {index === 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                      {getInitials(teacherName)}
                    </span>
                    {teacherName}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{rating ? rating.toFixed(1) : "0.0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{totalStudents}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || "Live"}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-lg font-bold text-foreground">
                      {course.price
                        ? `Rs. ${Number(course.price).toLocaleString()}`
                        : course.isFree
                          ? "Free"
                          : "Live"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {progress}% relevance
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

