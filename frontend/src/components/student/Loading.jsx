const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-outfit">
      <div className="relative">
        {/* Animated Rings */}
        <div className="h-24 w-24 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-primary animate-spin"></div>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-primary tracking-tight">NEX-L</h2>
        <p className="text-gray-400 font-medium mt-1">Preparing your learning journey...</p>
      </div>
    </div>
  );
};

export default Loading;
