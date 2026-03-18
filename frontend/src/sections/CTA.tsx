import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  const navigate = useNavigate();
  return (
    <section className="relative py-16 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background Gradient */}
          <div className="absolute inset-0 gradient-primary" />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-background/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-background/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-background/5 rounded-full blur-[120px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground/90">Start Your Journey Today</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-6 max-w-4xl mx-auto">
              Ready to Elevate Your Learning?
            </h2>

            {/* Description */}
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands of students and educators in Nepal who are already transforming 
              their educational experience with NEXL.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                size="lg" 
                className="bg-background text-primary hover:bg-background/90 px-8 py-6 text-lg font-semibold group"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-primary-foreground hover:bg-background/10 px-8 py-6 text-lg"
              >
                Contact Sales
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-primary-foreground/60 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
