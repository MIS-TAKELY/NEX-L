import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, BookOpen, Users, Zap } from 'lucide-react';

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative pt-24 lg:pt-32 pb-12 lg:pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Learning Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-8 animate-slide-up tracking-tight">
              Master Your Future with{' '}
              <span className="text-gradient">NEXL</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground/80 mb-10 max-w-xl mx-auto lg:mx-0 animate-slide-up stagger-1 leading-relaxed">
              The premium learning platform tailored for Nepal. 
              Elevate your skills with AI-driven personalization and world-class content.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-12 animate-slide-up stagger-2">
              <Button 
                size="lg" 
                className="gradient-primary hover:opacity-90 text-primary-foreground border-0 px-10 py-7 text-lg rounded-2xl shadow-lg shadow-primary/20 group"
                onClick={() => navigate('/signup')}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-border/60 hover:bg-secondary/80 px-10 py-7 text-lg rounded-2xl backdrop-blur-sm group">
                <Play className="w-5 h-5 mr-2 text-primary" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 animate-slide-up stagger-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">10K+</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">95%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative hidden lg:block animate-fade-in stagger-2">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="glass-card rounded-2xl p-6 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
                    <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                  </div>
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">75%</span>
                  </div>
                </div>
                
                {/* Course Cards */}
                <div className="space-y-3">
                  <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Web Development</p>
                      <div className="w-full h-2 bg-secondary rounded-full mt-2">
                        <div className="w-3/4 h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">Data Science</p>
                      <div className="w-full h-2 bg-secondary rounded-full mt-2">
                        <div className="w-1/2 h-full bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">AI & Machine Learning</p>
                      <div className="w-full h-2 bg-secondary rounded-full mt-2">
                        <div className="w-1/4 h-full bg-pink-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 glass-card rounded-xl p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievement</p>
                    <p className="text-foreground font-semibold">Fast Learner!</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 glass-card rounded-xl p-4 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Students</p>
                    <p className="text-foreground font-semibold">+128 today</p>
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
