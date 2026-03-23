import { ArrowRight, Star, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

const courses = [
  {
    id: 1,
    title: "Complete Web Development",
    instructor: "Sarah Chen",
    price: "Rs. 3,999",
    category: "Development",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    rating: 4.9,
    students: "12.5K",
    duration: "48h",
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    instructor: "Marcus Johnson",
    price: "Rs. 3,000",
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    rating: 4.8,
    students: "8.2K",
    duration: "32h",
  },
  {
    id: 3,
    title: "Digital Marketing Mastery",
    instructor: "Priya Sharma",
    price: "Rs. 2,499",
    category: "Marketing",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    rating: 4.7,
    students: "6.8K",
    duration: "28h",
  },
  {
    id: 4,
    title: "Data Science Essentials",
    instructor: "Alex Kumar",
    price: "Rs. 4,999",
    category: "Data",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    rating: 4.9,
    students: "9.1K",
    duration: "56h",
    featured: true,
  },
];

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
  return (
    <section id="courses" className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
              Explore our handpicked premium courses, designed for depth and
              professional mastery.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors group"
          >
            View all courses
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-primary font-medium"
                >
                  {course.category}
                </Badge>
                {course.featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {course.instructor}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-lg font-bold text-foreground">
                    {course.price}
                  </span>
                  <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
