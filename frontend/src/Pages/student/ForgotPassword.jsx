import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logoo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password for:', identifier);
    // Add reset password logic here
  };

  return (
    <div className="min-h-screen flex font-outfit">
      {/* Left Side - Dark Background with Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center px-12 md:px-20 text-foreground overflow-hidden">
        {/* Abstract lines decoration */}
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        <div className="absolute bottom-24 left-24 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        
        <div className="relative z-10 mb-20">
          <button 
            onClick={() => navigate(-1)}
            className="absolute -top-32 left-0 flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 text-foreground rounded-full transition-all font-medium backdrop-blur-sm border border-white/20 shadow-sm"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" /> go back
          </button>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Reset <br />
            Password
          </h1>
          <p className="text-xl text-gray-400 tracking-wide font-light">
            don't worry, we got you
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
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-6 md:p-8 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Back Button & Header */}
           <div className="lg:hidden mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-all font-medium mb-6 border border-primary/10"
            >
              <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" /> go back
            </button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="N" className="h-8 w-auto" />
              <h1 className="text-3xl font-bold text-primary">EXL</h1>
            </div>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-500">Enter your email or phone number and we'll send you a link to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Phone Number"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder-gray-400 text-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-foreground py-3.5 rounded-lg font-bold hover:bg-accent/90 transition-transform active:scale-[0.99] shadow-lg shadow-accent/20"
            >
              Send Reset Link
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-accent font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          </p>
          
          {/* Bottom Right Decoration */}
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary rounded-full hidden md:block opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
