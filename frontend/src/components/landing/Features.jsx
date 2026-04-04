import { Wallet, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
            About Us
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We provide the best learning experience with features designed for
            your success.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "Local Payment Integration",
              desc: "Seamlessly enroll in courses using eSewa, Khalti, and IME Pay with low transaction fees.",
              Icon: Wallet,
            },
            {
              title: "AI-Powered Learning",
              desc: "Benefit from automatic video summarization and personalized course recommendations.",
              Icon: Sparkles,
            },
            {
              title: "Gamified Progress",
              desc: "Stay motivated by earning performance badges and tracking your achievements.",
              Icon: Trophy,
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-md bg-muted hover:bg-background border border-transparent hover:border-border hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className={`w-14 h-14 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center text-primary">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-foreground font-bold hover:text-primary hover:scale-110 transition-all duration-300 group"
          >
            Learn More
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
