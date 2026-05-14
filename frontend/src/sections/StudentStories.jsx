import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { useGetPublicCoursesQuery } from "@/store/slices/siteApi";
import { buildCourseInsights, getInitials } from "@/lib/siteInsights";

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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function StudentStories() {
  const { data: courses = [] } = useGetPublicCoursesQuery();
  const insights = buildCourseInsights(courses);
  const stories = insights.topCourses;

  return (
    <section className="py-20 lg:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Learner Highlights
          </h2>
          <p className="text-lg text-muted-foreground">
            Live course highlights from the current catalog, ranked by learner feedback signals.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stories.length > 0 ? (
            stories.map((story, index) => (
              <motion.div
                key={story.id || story._id || story.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative bg-card rounded-md p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6 flex items-center justify-between">
                  <Quote className="w-10 h-10 text-primary/20" />
                  <div className="flex gap-1">
                    {Array.from({ length: Math.max(1, Math.round(Number(story.rating || 0))) }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-foreground/90 text-lg leading-relaxed mb-8">
                  {story.description}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    {getInitials(story.title)}
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground">
                      {story.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {story.instructor} · {story.category}
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-3 rounded-md border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              No live course highlights available yet.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

