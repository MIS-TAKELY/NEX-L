import { Icon } from '@iconify/react';

const SocialTopbar = () => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm text-white text-xs py-2 px-6 lg:px-12 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <a href="#" className="hover:text-white/80 transition-colors">📧 Blogs</a>
          <a href="#" className="hover:text-white/80 transition-colors">📖 Our Story</a>
          <a href="#" className="hover:text-white/80 transition-colors">📍 Contact & Location</a> */}
        </div>
        <div className="flex items-center gap-3">
          <button className="hover:text-white/80 transition-colors" aria-label="Facebook">
            <Icon icon="mdi:facebook" className="w-4 h-4" />
          </button>
          <button className="hover:text-white/80 transition-colors" aria-label="Twitter">
            <Icon icon="mdi:twitter" className="w-4 h-4" />
          </button>
          <button className="hover:text-white/80 transition-colors" aria-label="Instagram">
            <Icon icon="mdi:instagram" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialTopbar;
