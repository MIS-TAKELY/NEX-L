import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../apis/course.api';
import { AppContext } from '../../context/AppContext';

const Home = () => {
    const { userData } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getAllCourses();
                setCourses(data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const getIcon = (category) => {
        switch (category?.toUpperCase()) {
            case 'UI/UX DESIGN': return 'solar:palet-2-bold';
            case 'FRONT END': return 'solar:laptop-minimalistic-bold';
            default: return 'solar:tag-price-bold';
        }
    };

    // Extract unique mentors from courses
    const mentors = courses.reduce((acc, course) => {
        if (course.teacher && !acc.find(m => m._id === course.teacher._id)) {
            acc.push(course.teacher);
        }
        return acc;
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-8">

            {/* Middle Column - Main Content */}
            <div className="flex-1 flex flex-col gap-8">
                {/* Banner Section */}
                <div className="bg-primary rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary/20 shrink-0">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-10 opacity-20">
                        <Icon icon="solar:magic-stick-3-bold" className="text-9xl" />
                    </div>

                    <div className="relative z-10 max-w-lg cursor-pointer" onClick={() => navigate("/course-list")}>
                        <p className="text-blue-100 text-xs font-bold tracking-widest uppercase mb-2">Learning Platform</p>
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">NEXL: Elevate Your Learning</h1>
                        <button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2">
                            Explore Courses
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                <Icon icon="solar:alt-arrow-right-linear" />
                            </span>
                        </button>
                    </div>
                </div>

                {/* Course Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    {loading ? (
                        [1, 2, 3].map((_, i) => (
                            <div key={i} className="bg-card p-4 rounded-2xl animate-pulse flex items-center gap-3 border border-border">
                                <div className="w-10 h-10 rounded-xl bg-muted"></div>
                                <div className="flex-1">
                                    <div className="h-2 w-12 bg-muted rounded mb-2"></div>
                                    <div className="h-4 w-24 bg-muted rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : courses.length > 0 ? (
                        courses.slice(0, 3).map((course, i) => (
                            <div key={course._id} className="bg-card p-4 rounded-2xl flex items-center justify-between border border-border hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center text-xl`}>
                                        <Icon icon={getIcon(course.category)} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-1">0/10 watched</p>
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">{course.title}</p>
                                    </div>
                                </div>
                                <button className="text-muted-foreground group-hover:text-foreground">⋮</button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-4 text-muted-foreground">No courses found</div>
                    )}
                </div>


                {/* Continue Watching Section */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-foreground">Continue Watching</h2>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted">
                                <Icon icon="solar:alt-arrow-left-linear" />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                <Icon icon="solar:alt-arrow-right-linear" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            [1, 2].map((_, i) => (
                                <div key={i} className="bg-card p-4 rounded-3xl border border-border animate-pulse">
                                    <div className="h-40 bg-muted rounded-2xl mb-4"></div>
                                    <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                                    <div className="h-6 w-full bg-muted rounded mb-4"></div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                                        <div className="w-8 h-8 rounded-full bg-muted"></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-20 bg-muted rounded mb-1"></div>
                                            <div className="h-2 w-10 bg-muted rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : courses.length > 0 ? (
                            courses.slice(0, 2).map((course) => (
                                <div key={course._id} className="bg-card p-4 rounded-3xl border border-border hover:shadow-xl transition-all group">
                                    <div className="h-40 bg-muted rounded-2xl mb-4 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=500&auto=format&fit=crop"})` }}></div>
                                        <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:bg-white/50 flex items-center justify-center">
                                            <Icon icon="solar:heart-bold" size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block uppercase">{course.category || "General"}</span>
                                        <h3 className="font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                                        <div className="flex items-center gap-3 border-t border-border pt-4">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                                                {course.teacher?.avatar ? (
                                                    <img src={course.teacher.avatar} alt={course.teacher.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="solar:user-circle-linear" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">{course.teacher?.name || "Unknown Instructor"}</p>
                                                <p className="text-[10px] text-muted-foreground">Mentor</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 text-muted-foreground bg-card rounded-3xl border border-border">
                                No courses available to watch.
                            </div>
                        )}
                    </div>

                </div>

                {/* Your Lesson List Preview */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-foreground">Your Lesson</h2>
                        <span className="text-xs font-bold text-primary cursor-pointer flex items-center gap-1">
                            See all
                            <Icon icon="solar:arrow-right-linear" />
                        </span>
                    </div>
                    {/* Reuse basic table style for now or simple list */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center justify-between p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary border border-border">
                                    <Icon icon="solar:user-circle-bold-duotone" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Padhang Satrio</p>
                                    <p className="text-xs text-muted-foreground">2/16/2004</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">UI/UX DESIGN</span>
                            <div className="hidden md:block text-sm font-medium text-foreground/80">Understand Of UI/UX Design</div>
                            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground">›</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Sidebar - Statistics */}
            <div className="w-full md:w-80 flex flex-col gap-8 shrink-0">
                {/* Statistic Card */}
                <h3 className="text-xl font-bold text-foreground">Statistic</h3>

                <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-primary/40 flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-primary">
                                <Icon icon="solar:user-circle-bold-duotone" size={48} />
                            </div>
                        </div>
                        <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">32%</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug flex items-center justify-center gap-2">
                        Good Morning {userData?.name?.split(' ')[0] || 'Student'} <Icon icon="solar:fire-bold" className="text-orange-500" />
                    </h3>
                    <p className="text-xs text-muted-foreground mb-6">Continue your learning to achieve your target!</p>

                    {/* Chart Placeholder */}
                    <div className="bg-muted/50 rounded-2xl p-4 h-40 flex items-end justify-between px-2">
                        <div className="w-4 bg-primary/20 rounded-t-lg h-1/3"></div>
                        <div className="w-4 bg-primary/40 rounded-t-lg h-1/2"></div>
                        <div className="w-4 bg-primary/20 rounded-t-lg h-1/4"></div>
                        <div className="w-4 bg-primary rounded-t-lg h-full shadow-lg shadow-primary/30"></div>
                        <div className="w-4 bg-primary/20 rounded-t-lg h-1/4"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
                        <span>1-10 Aug</span>
                        <span>11-20 Aug</span>
                        <span>21-30 Aug</span>
                    </div>
                </div>

                {/* Your Mentor */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-foreground">Mentors</h3>
                        <button className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                            <Icon icon="solar:add-circle-linear" />
                        </button>
                    </div>

                    <div className="bg-card rounded-[2rem] p-6 border border-border shadow-sm space-y-6">
                        {loading ? (
                            [1, 2].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-20 bg-muted rounded mb-1"></div>
                                        <div className="h-2 w-10 bg-muted rounded"></div>
                                    </div>
                                </div>
                            ))
                        ) : mentors.length > 0 ? (
                            mentors.slice(0, 3).map((mentor, i) => (
                                <div key={mentor._id || i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary border border-border overflow-hidden">
                                            {mentor.avatar ? (
                                                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="solar:user-circle-bold-duotone" size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{mentor.name}</p>
                                            <p className="text-xs text-muted-foreground">Mentor</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:text-foreground transition-colors">
                                        <Icon icon="solar:user-plus-linear" className="text-sm" /> Follow
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-xs text-muted-foreground italic">
                                No mentors found for your courses.
                            </div>
                        )}

                        <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-xs hover:bg-primary/20 transition-colors">
                            See All
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
