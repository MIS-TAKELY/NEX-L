import { Icon } from '@iconify/react';

const SocialTopbar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-transparent text-white text-xs py-1 px-6 lg:px-12 z-50 bg-pink-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <a href="#" className="hover:text-white/80 transition-colors">📧 Blogs</a>
          <a href="#" className="hover:text-white/80 transition-colors">📖 Our Story</a>
          <a href="#" className="hover:text-white/80 transition-colors">📍 Contact & Location</a> */}
        </div>
        <div className="flex items-center gap-3">
          <button className="hover:text-white/80 transition-colors">
            <Icon icon="solar:facebook-bold" className="w-4 h-4" />
          </button>
          <button className="hover:text-white/80 transition-colors">
            <Icon icon="solar:twitter-bold" className="w-4 h-4" />
          </button>
          <button className="hover:text-white/80 transition-colors">
            <Icon icon="solar:instagram-bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialTopbar;
