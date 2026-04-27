import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authClient, signOut } from '../../lib/auth.client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlError = searchParams.get('error');

    if (urlToken) {
      setToken(urlToken);
      return;
    }

    if (urlError === 'INVALID_TOKEN') {
      setError('That reset link is invalid or has expired. Please request a new one.');
      return;
    }

    if (urlError) {
      setError('The reset link could not be used. Please request a new one.');
      return;
    }

    if (!urlToken) {
      setError('Invalid or missing reset token. Please request a new link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: newPassword,
        token: token,
      });
      
      if (authError) {
        setError(authError.message || 'Failed to reset password. The link might have expired.');
      } else {
        try {
          await signOut();
        } catch (signOutError) {
          console.warn('Password reset succeeded, but session cleanup failed:', signOutError);
        }
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-outfit">
      {/* Left Side - Dark Background with Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center px-12 md:px-20 text-foreground overflow-hidden">
        {/* Abstract lines decoration */}
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-md transform rotate-12" />
        <div className="absolute bottom-24 left-24 w-48 h-48 border border-white/10 rounded-md transform rotate-12" />
        
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Set New <br />
            Password
          </h1>
          <p className="text-xl text-muted-foreground tracking-wide font-light">
            almost there, secure your account
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
          {/* Mobile Header */}
           <div className="lg:hidden mb-8">
            <h1 className="text-3xl font-bold text-primary">NEXL</h1>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create New Password</h2>
            <p className="text-muted-foreground">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-4 py-3 rounded-md bg-muted border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder-gray-400 text-foreground"
                required
                disabled={!token || !!message}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-md bg-muted border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder-gray-400 text-foreground"
                required
                disabled={!token || !!message}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={isLoading || !token || !!message}
              className="w-full bg-accent text-foreground py-3.5 rounded-md font-bold hover:bg-accent/90 transition-transform active:scale-[0.99] shadow-lg shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-accent font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          </p>
          
          {/* Bottom Right Decoration */}
           <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary rounded-md hidden md:block opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
