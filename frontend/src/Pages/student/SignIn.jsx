import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGoogle
} from "@tabler/icons-react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex font-outfit">
      {/* Left Side - Dark Background with Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center px-12 md:px-20 text-primary-foreground overflow-hidden">
        {/* Abstract lines decoration */}
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        <div className="absolute bottom-24 left-24 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        
        <div className="relative z-10 mb-20">
          <button 
            onClick={() => navigate(-1)}
            className="absolute -top-32 left-0 flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            ← go back
          </button>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Welcome <br />
            Back
          </h1>
          <p className="text-xl text-primary-foreground/80 tracking-wide font-light">
            continue with us
          </p>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute top-0 right-0 bottom-0 w-24 translate-x-[1px] h-full pointer-events-none">
           <svg 
            className="h-full w-full fill-white" 
            preserveAspectRatio="none" 
            viewBox="0 0 100 100"
          >
            <path d="M0 0 C 40 10 40 30 20 50 C 0 70 0 90 20 100 L 100 100 L 100 0 Z" />
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-card flex items-center justify-center p-4 md:p-6 relative">
        <div className="w-full max-w-md">
           {/* Mobile Back Button & Header */}
           <div className="lg:hidden mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              ← go back
            </button>
            <h1 className="text-3xl font-bold text-primary">NEX-L</h1>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-xl font-bold text-foreground dark:text-neutral-200">
              Sign In
            </h2>
             <p className="mt-1 text-sm text-muted-foreground dark:text-neutral-300">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="my-4">
            <div className="flex flex-col space-y-4">
              <LabelInputContainer>
                <Label htmlFor="identifier" className="text-base">Email or Phone Number</Label>
                <input 
                  id="identifier" 
                  name="identifier" 
                  placeholder="123@gmail.com" 
                  type="text" 
                  value={formData.identifier} 
                  onChange={handleChange} 
                  required 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password" className="text-base">Password</Label>
                <input 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </LabelInputContainer>
            </div>

            <div className="flex justify-end mt-2 mb-4">
                <button onClick={() => navigate('/forgot-password')} className="text-sm text-muted-foreground hover:text-accent">Forgot Password?</button>
            </div>

            <button
              className="group/btn relative block h-9 w-full rounded-md bg-primary text-primary-foreground font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              type="submit">
              Sign In
            </button>

            <div className="my-4 h-[1px] w-full bg-border" />

            <div className="flex flex-col space-y-4">
               <button
                 className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                 type="button">
                 <IconBrandGithub className="h-4 w-4 text-foreground dark:text-neutral-300" />
                 <span className="text-sm text-muted-foreground dark:text-neutral-300">
                   GitHub
                 </span>   
               </button>
               <button
                 className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                 type="button">
                 <IconBrandGoogle className="h-4 w-4 text-foreground dark:text-neutral-300" />
                 <span className="text-sm text-muted-foreground dark:text-neutral-300">
                   Google
                 </span>
 
               </button>
               <button
                 className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                 type="button">
                 <IconBrandFacebook className="h-4 w-4 text-foreground dark:text-neutral-300" />
                 <span className="text-sm text-muted-foreground dark:text-neutral-300">
                   Facebook
                 </span>
 
               </button>
            </div>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="text-accent font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
          
          {/* Bottom Right Decoration */}
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary rounded-full hidden md:block opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default SignIn;
