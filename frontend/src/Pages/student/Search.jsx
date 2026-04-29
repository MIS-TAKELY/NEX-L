import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useSearchCoursesVectorQuery } from "@/store/slices/courseApi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import CourseCard from "../../components/landing/CourseCard";
import CourseSkeleton from "../../components/skeletons/CourseSkeleton";

const CATEGORY_OPTIONS = [
    { label: "Development", value: "Development" },
    { label: "Business", value: "Business" },
    { label: "Design", value: "Design" },
    { label: "Marketing", value: "Marketing" },
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const normalizeCategory = (value) => {
    if (!value) return "";
    const raw = String(value).trim().toLowerCase();
    if (raw === "web development" || raw === "mobile development" || raw === "data science") {
        return "Development";
    }
    if (raw === "business" || raw === "design" || raw === "marketing") {
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return value;
};

const normalizeLevel = (value) => {
    if (!value) return "";
    const raw = String(value).trim().toLowerCase();
    if (raw === "beginner") return "Beginner";
    if (raw === "intermediate") return "Intermediate";
    if (raw === "advanced") return "Advanced";
    return value;
};

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [q, setQ] = useState(searchParams.get("q") || "");
    const [debouncedQ, setDebouncedQ] = useState(q);
    const [category, setCategory] = useState(normalizeCategory(searchParams.get("category") || ""));
    const [level, setLevel] = useState(normalizeLevel(searchParams.get("level") || ""));
    const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "all");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQ(q);
        }, 500);
        return () => clearTimeout(timer);
    }, [q]);

    const { data: results, isFetching } = useSearchCoursesVectorQuery({
        q: debouncedQ,
        category,
        level,
        minPrice: priceRange === "free" ? "0" : priceRange === "paid" ? "1" : "",
        maxPrice: priceRange === "free" ? "0" : ""
    });

    useEffect(() => {
        const params = {};
        if (debouncedQ) params.q = debouncedQ;
        if (category) params.category = category;
        if (level) params.level = level;
        if (priceRange !== "all") params.priceRange = priceRange;
        setSearchParams(params, { replace: true });
    }, [debouncedQ, category, level, priceRange, setSearchParams]);

    return (
        <div className="flex flex-col min-h-screen bg-muted font-outfit">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-80 space-y-8">
                            <div className="bg-background p-6 rounded-md shadow-sm border border-border">
                                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                    <Icon icon="solar:filter-bold-duotone" className="text-accent" />
                                    Filters
                                </h3>

                                <div className="space-y-6">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full p-3 bg-muted border-2 border-transparent focus:border-primary rounded-md outline-none transition-all"
                                        >
                                            <option value="">All Categories</option>
                                            {CATEGORY_OPTIONS.map((cat) => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Filter */}
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Level</label>
                                        <div className="space-y-2">
                                            {["", ...LEVEL_OPTIONS].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setLevel(lvl)}
                                                    className={`w-full text-left px-4 py-2.5 rounded-md transition-all font-medium ${level === lvl ? "bg-primary text-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
                                                        }`}
                                                >
                                                    {lvl || "All Levels"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Filter */}
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Price</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "All", value: "all" },
                                                { label: "Free", value: "free" },
                                                { label: "Paid", value: "paid" }
                                            ].map((p) => (
                                                <button
                                                    key={p.value}
                                                    onClick={() => setPriceRange(p.value)}
                                                    className={`px-4 py-2 rounded-md border-2 transition-all font-bold text-sm ${priceRange === p.value
                                                            ? "bg-accent border-accent text-foreground"
                                                            : "border-border text-muted-foreground hover:border-accent/30"
                                                        }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setCategory(""); setLevel(""); setPriceRange("all"); setQ(""); }}
                                        className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-md transition-all"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Results Content */}
                        <div className="flex-1">
                            <div className="relative mb-8 group">
                                <Icon
                                    icon="solar:magnifer-linear"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                                    size={24}
                                />
                                <input
                                    type="text"
                                    placeholder="Search for anything..."
                                    className="w-full pl-16 pr-6 py-5 bg-background border-2 border-transparent focus:border-primary rounded-md shadow-sm outline-none transition-all text-xl"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                            </div>

                            {isFetching ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <CourseSkeleton key={`skeleton-${i}`} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {results && results.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                            {results.map((course) => (
                                                <CourseCard key={course._id} course={course} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-32 bg-background rounded-md border-2 border-dashed border-border">
                                            <Icon icon="solar:document-grey-bold" className="mx-auto text-gray-100 mb-6" width={80} />
                                            <h3 className="text-3xl font-bold text-muted-foreground">No courses found</h3>
                                            <p className="text-muted-foreground mt-2 text-lg">Try adjusting your filters or search query.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Search;
