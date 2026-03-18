import { UserPlus, Search, CreditCard, GraduationCap } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up as a student or teacher in seconds. Set up your profile and preferences.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover Courses',
    description: 'Browse through hundreds of courses or use AI recommendations to find the perfect match.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Easy Enrollment',
    description: 'Enroll with local payment methods like eSewa, Khalti, or use discount coupons.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    number: '04',
    icon: GraduationCap,
    title: 'Start Learning',
    description: 'Access course materials, join live sessions, take quizzes, and earn certificates.',
    color: 'from-orange-500 to-amber-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-muted-foreground">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How{' '}
            <span className="text-gradient">NEXL</span>{' '}
            Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Getting started with NEXL is easy. Follow these simple steps to begin your learning journey.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative">
                {/* Step Number */}
                <div className={`absolute -top-4 -left-2 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${step.color} opacity-20`}>
                  {step.number}
                </div>

                {/* Card */}
                <div className="glass-card rounded-2xl p-6 pt-10 relative z-10 h-full group-hover:bg-secondary/80 transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to start your learning journey?
          </p>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-primary hover:text-foreground transition-colors font-medium"
          >
            Get Started Now
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
