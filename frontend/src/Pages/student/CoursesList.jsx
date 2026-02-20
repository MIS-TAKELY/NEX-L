import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useGetCourseSectionsQuery, useSearchCoursesVectorQuery } from "@/store/slices/courseApi";
import Footer from "../../components/common/Footer";
import Navbar from "../../components/common/Navbar";
import CourseCard from "../../components/landing/CourseCard";

const CoursesList = () => {
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
    isLoggedIn ? userData?._id : undefined,
    { skip: debouncedQuery.length > 0 }
  );

  const { data: searchResults, isFetching: searchLoading } = useSearchCoursesVectorQuery(
    debouncedQuery,
    { skip: debouncedQuery.length < 2 }
  );

  const sections = sectionsResp || {};
  const isSearching = debouncedQuery.length >= 2;

  const renderSection = (title, courses, subtitle) => {
    if (!courses || courses.length === 0) return null;

    return (
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            {title}
            <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1"></span>
          </h2>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <CourseCard key={course._id || course.id} course={course} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      <Navbar />

      <main className="flex-1 bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 leading-tight">
                {isSearching ? 'Search' : 'Discover'} <span className="italic text-accent">{isSearching ? 'Results' : 'Knowledge'}</span>
              </h1>
              <p className="text-gray-500 max-w-lg">
                {isSearching
                  ? `Found semantically similar courses for "${debouncedQuery}"`
                  : 'Explore our curated collections of courses tailored for your success.'
                }
              </p>
            </div>

            <div className="relative w-full md:w-96 group">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Semantic search (e.g. build apps, AI, design...)"
                className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-primary rounded-2xl shadow-sm outline-none transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {(sectionsLoading || searchLoading) ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400 font-medium">
                {searchLoading ? 'Calculating semantic similarity...' : 'Curating your feed...'}
              </p>
            </div>
          ) : (
            <>
              {isSearching ? (
                <>
                  {searchResults && searchResults.length > 0 ? (
                    renderSection(`Results for "${debouncedQuery}"`, searchResults)
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                      <Icon icon="solar:document-grey-bold" className="mx-auto text-gray-200 mb-4" width={64} />
                      <h3 className="text-2xl font-bold text-gray-400">No semantic matches found.</h3>
                      <p className="text-gray-400 mt-2">Try a different phrase or descriptive sentence.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {renderSection("Recently Viewed", sections.recentlyViewed, "Continue where you left off.")}
                  {renderSection("Recommendations", sections.recommendations, "Hand-picked courses based on your interests.")}
                  {renderSection("Trending", sections.trending, "The most popular and recently added courses.")}
                  {renderSection("Top Deals", sections.topDeals, "Premium courses with exclusive discounts.")}

                  {!sectionsLoading && Object.values(sections).every(arr => !arr || arr.length === 0) && (
                    <div className="text-center py-20">
                      <h3 className="text-2xl font-bold text-gray-400">No courses currently available.</h3>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesList;
