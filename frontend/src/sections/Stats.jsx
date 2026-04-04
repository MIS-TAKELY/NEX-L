import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 12500,
    suffix: "+",
    label: "Active Students",
    description: "Learning on our platform",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BookOpen,
    value: 850,
    suffix: "+",
    label: "Courses Available",
    description: "Across various subjects",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Award,
    value: 450,
    suffix: "+",
    label: "Expert Instructors",
    description: "Teaching on NEXL",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    value: 98,
    suffix: "%",
    label: "Success Rate",
    description: "Student satisfaction",
    color: "from-orange-500 to-amber-500",
  },
];

function AnimatedNumber({ value, suffix }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-16 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the growing community of learners and educators transforming
            education in Nepal.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group glass-card rounded-md p-8 text-center hover:bg-secondary/80 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-md bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>

              {/* Value */}
              <div className="text-4xl lg:text-5xl font-bold text-foreground mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>

              {/* Label */}
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
