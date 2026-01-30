import { useNavigate } from 'react-router-dom';
import { BackgroundGradient } from '../ui/background-gradient';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center py-20 px-4">
      <BackgroundGradient className="rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900 border border-black/5" containerClassName="max-w-4xl w-full">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Elevate Your Learning?</h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">Join NEXL today to access affordable, high-quality education tailored for you.</p>
          <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-black/10 hover:shadow-black/20">
            Sign Up Now
          </button>
        </div>
      </BackgroundGradient>
    </div>
  );
};

export default CTA;
