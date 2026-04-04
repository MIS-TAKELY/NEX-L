import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCourseSectionsQuery, useSearchCoursesVectorQuery } from "@/store/slices/courseApi";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import CourseCard from "../../components/landing/CourseCard";
import CourseSkeleton from "../../components/skeletons/CourseSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CoursesList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 600); // 600ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { userData, isLoggedIn } = useSelector((state) => state.auth);
  const { data: sectionsResp, isLoading: sectionsLoading } = useGetCourseSectionsQuery(
    isLoggedIn ? userData?._id : undefined
  );

  const { data: searchResults, isFetching: searchLoading } = useSearchCoursesVectorQuery(
    { q: debouncedQuery },
    { skip: debouncedQuery.length < 2 }
  );

  const sections = sectionsResp || {};
  const isSearching = debouncedQuery.length >= 2;

  const renderSection = (title, courses, subtitle, key) => {
    if (!courses || courses.length === 0) return null;

    return (
      <div key={key} className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col mb-10">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            {title}
            <span className="h-2 w-2 rounded-md bg-primary mt-1 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
          </h2>
          {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, idx) => (
            <CourseCard key={course._id || course.id} course={course} index={idx} />
          ))}
        </div>
      </div>
    );
  };

  const renderSkeletons = (title) => (
    <div className="mb-16">
      <div className="flex flex-col mb-8 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <CourseSkeleton key={`skeleton-${title}-${i}`} />
        ))}
      </div>
    </div>
  );

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-outfit text-foreground bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="gradient-mesh fixed inset-0 pointer-events-none opacity-60" />
      
      <Navbar />

      <main className="flex-1 relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-6">
          {/* Compact Header & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-border/40">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Explore <span className="text-gradient">Catalog</span>
            </h1>

            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all duration-500 rounded-md" />
              <div className="relative flex items-center glass-card border border-border/50 rounded-md overflow-hidden group-focus-within:border-primary/40 transition-all duration-300">
                <Icon
                  icon="solar:magnifer-linear"
                  className="ml-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full pl-3 pr-4 py-3.5 bg-transparent outline-none text-sm placeholder:text-muted-foreground/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="relative">
            {isSearching ? (
              <div className="space-y-4">
                {searchLoading ? (
                  renderSkeletons("Search Results")
                ) : (
                  <>
                    {renderSection(`Results for "${debouncedQuery}"`, searchResults, `Found ${searchResults?.length || 0} best matches.`)}
                    {!searchResults?.length && !searchLoading && (
                      <div className="text-center py-32 glass rounded-md border border-dashed border-border">
                        <Icon icon="solar:document-broken-linear" className="mx-auto text-muted-foreground/20 mb-6" size={80} />
                        <h3 className="text-2xl font-bold text-muted-foreground">No courses matching your search.</h3>
                        <p className="text-muted-foreground/60 mt-2">Try adjusting your keywords or browse categories.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {sectionsLoading ? (
                  <div className="space-y-16">
                    {["Trending", "Recommendations", "Recently Viewed"].map((title) => (
                      <div key={title} className="mb-16">
                        <div className="flex flex-col mb-8">
                          <div className="h-10 bg-muted rounded-md w-64 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-muted/50 rounded-md w-48 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {[1, 2, 3, 4].map((i) => (
                            <CourseSkeleton key={`skeleton-${title}-${i}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {renderSection("Trending Now", sections.trending, "The most popular courses right now.", "trending")}
                    {renderSection("Recommended for You", sections.recommendations, "Hand-picked for your learning path.", "recommendations")}
                    {renderSection("Recently Viewed", sections.recentlyViewed, "Pick up where you left off.", "recently-viewed")}
                    
                    {/* Category-wise Sections */}
                    {sections.categorySections?.map((catSection) => (
                      renderSection(catSection.category, catSection.courses, `Top courses in ${catSection.category}`, catSection.category)
                    ))}

                    {renderSection("Exclusive Deals", sections.topdeals, "Premium content at exclusive prices.")}

                    {(!sections.recentlyViewed?.length &&
                      !sections.recommendations?.length &&
                      !sections.categorySections?.length &&
                      !sections.trending?.length &&
                      !sections.topdeals?.length) && (
                        <div className="text-center py-32 glass rounded-md border border-dashed border-border">
                          <Icon icon="solar:cloud-snow-linear" className="mx-auto text-muted-foreground/20 mb-6" size={80} />
                          <h3 className="text-2xl font-bold text-muted-foreground">No courses currently available.</h3>
                          <p className="text-muted-foreground/60 mt-2">Check back later or explore other sections.</p>
                        </div>
                      )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesList;
