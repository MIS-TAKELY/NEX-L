const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted font-outfit">
      <div className="relative">
        {/* Animated Rings */}
        <div className="h-24 w-24 rounded-md border-4 border-primary/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-md border-t-4 border-primary animate-spin"></div>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-primary tracking-tight">NEXL</h2>
        <p className="text-muted-foreground font-medium mt-1">Preparing your learning journey...</p>
      </div>
    </div>
  );
};

export default Loading;
