import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center py-20 px-4">
      <div className="max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-primary/5 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl shadow-primary/5">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            Ready to <span className="text-primary italic">Elevate</span> Your Learning?
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto text-lg">
            Join NEXL today to access affordable, high-quality education tailored for your career goals.
          </p>
          <button 
            onClick={() => navigate('/signup')} 
            className="px-12 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transform tracking-wide"
          >
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTA;
