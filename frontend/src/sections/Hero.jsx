import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Users, Zap } from "lucide-react";
import { buildCourseInsights, compactNumber, formatRating } from "@/lib/siteInsights";
import { useGetPublicCoursesQuery } from "@/store/slices/siteApi";

export function Hero() {
  const navigate = useNavigate();
  const { data: courses = [] } = useGetPublicCoursesQuery();
  const insights = buildCourseInsights(courses);
  const topCourses = insights.topCourses;
  const platformCompletion = Math.min(100, Math.round(Number(formatRating(insights.averageRating)) * 20));
  return (
    <section className="relative pt-24 lg:pt-32 pb-12 lg:pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-md blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-md blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md glass-card mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                AI-Powered Learning Platform
              </span>
            </div> */}

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-8 animate-slide-up tracking-tight">
              Master Your Future with{" "}
              <span className="text-gradient">NEXL</span>
            </h1> 

            {/* Description */}
            <p className="text-xl text-muted-foreground/80 mb-10 max-w-xl mx-auto lg:mx-0 animate-slide-up stagger-1 leading-relaxed">
              The premium learning platform tailored for Nepal. Elevate your
              skills with personalization and quality content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-12 animate-slide-up stagger-2">
              <Button
                size="lg"
                className="gradient-primary hover:opacity-90 text-primary-foreground border-0 px-10 py-7 text-lg rounded-md shadow-lg shadow-primary/20 group"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 animate-slide-up stagger-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {compactNumber(insights.totalCourses)}
                  </p>
                  <p className="text-sm text-muted-foreground">Published Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {compactNumber(insights.totalInstructors)}
                  </p>
                  <p className="text-sm text-muted-foreground">Expert Instructors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {formatRating(insights.averageRating)}/5
                  </p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative hidden lg:block animate-fade-in stagger-2">
            <div className="relative">
              {/* Main Dashboard Card */}
                  <div className="glass-card rounded-md p-6 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Live Platform Snapshot
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Updated from the current catalog
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-md gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">
                      {platformCompletion}%
                    </span>
                  </div>
                </div>

                {/* Course Cards */}
                <div className="space-y-3">
                  {(topCourses.length > 0 ? topCourses : [
                    { title: "No course data", category: "Live API", rating: "0.0", reviews: 0 },
                  ]).map((course, index) => {
                    const progress = Math.max(20, Math.min(100, Math.round(Number(course.rating || 0) * 20)));
                    const icons = [BookOpen, Zap, Sparkles];
                    const IconComponent = icons[index % icons.length];
                    const accentClasses = [
                      "bg-blue-500/20 text-blue-400 bg-blue-500",
                      "bg-purple-500/20 text-purple-400 bg-purple-500",
                      "bg-pink-500/20 text-pink-400 bg-pink-500",
                    ];
                    const accent = accentClasses[index % accentClasses.length];

                    return (
                      <div key={course.id || course.title} className="bg-secondary/50 rounded-md p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center ${accent.split(" ")[0]}`}>
                          <IconComponent className={`w-6 h-6 ${accent.split(" ")[1]}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.category} · {course.instructor}
                          </p>
                          <div className="w-full h-2 bg-secondary rounded-md mt-2">
                            <div className={`h-full rounded-md ${accent.split(" ")[2]}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 glass-card rounded-md p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement</p>
                    <p className="text-foreground font-semibold">
                      Fast Learner!
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-6 glass-card rounded-md p-4 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Live Courses
                    </p>
                    <p className="text-foreground font-semibold">
                      {compactNumber(insights.totalCourses)} available now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
