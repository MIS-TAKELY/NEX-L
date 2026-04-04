import {
  BookOpen,
  CreditCard,
  MessageCircle,
  Trophy,
  Brain,
  Video,
  Search,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Create and manage courses with flexible pricing, video uploads, quizzes, and assignments.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: CreditCard,
    title: "Local Payments",
    description:
      "Seamless integration with eSewa, Khalti, IME Pay, and other Nepali payment gateways.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Brain,
    title: "AI Summarization",
    description:
      "Get automatic summaries of video lectures and notes powered by advanced AI models.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description:
      "Interactive group chats and one-on-one tutoring sessions for better engagement.",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    icon: Search,
    title: "Smart Recommendations",
    description:
      "AI-driven course recommendations based on your interests and learning history.",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn badges, track quiz rankings, and stay motivated with achievement systems.",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    icon: Video,
    title: "Live Streaming",
    description:
      "Host live classes with optional recording for later access and review.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    description:
      "Book one-on-one tutoring sessions with your favorite instructors seamlessly.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-12 lg:pt-16 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md glass-card mb-6">
            <span className="w-2 h-2 rounded-md bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Learn & Teach</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            NEXL combines cutting-edge technology with user-friendly design to
            create the ultimate learning experience for students and educators
            in Nepal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group glass-card rounded-md p-6 hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-md ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Gradient Border Effect */}
              <div
                className={`absolute inset-0 rounded-md bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
