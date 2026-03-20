import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { getAllCourses } from '../../apis/course.api';

const Home = () => {
    const { userData } = useSelector((state) => state.auth);
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
        <div className="flex flex-col lg:flex-row gap-12 pt-8">

            {/* Middle Column - Main Content */}
            <div className="flex-1 flex flex-col gap-12">
                {/* Banner Section */}
                <div className="bg-primary/5 rounded-3xl p-12 md:p-16 relative overflow-hidden border border-primary/10">
                    <div className="relative z-10 max-w-xl">
                        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-4 serif italic">Welcome back, {userData?.name?.split(' ')[0] || 'Scholar'}</p>
                        <h1 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] text-foreground serif">
                           NEXL: Your Journey to <span className="text-primary italic">Mastery</span>
                        </h1>
                        <button 
                            onClick={() => navigate("/course-list")}
                            className="bg-primary text-foreground hover:bg-primary-hover px-10 py-4 rounded-2xl font-bold text-base transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group"
                        >
                            Explore Global Courses
                            <Icon icon="solar:alt-arrow-right-linear" className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    {/* Floating Decorative Element */}
                    <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                        <Icon icon="solar:magic-stick-3-bold" className="text-[300px] text-primary" />
                    </div>
                </div>

                {/* Course Progress Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map((_, i) => (
                            <div key={i} className="bg-card backdrop-blur-xl p-6 rounded-2xl animate-pulse h-32 border border-border"></div>
                        ))
                    ) : courses.length > 0 ? (
                        courses.slice(0, 3).map((course) => (
                            <div key={course._id} className="bg-card backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between border border-border hover:shadow-xl transition-all cursor-pointer group premium-card">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                                        <Icon icon={getIcon(course.category)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">In Progress</p>
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[140px] serif italic">{course.title}</p>
                                    </div>
                                </div>
                                <Icon icon="solar:alt-arrow-right-linear" className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        ))
                    ) : null}
                </div>


                {/* Featured / Continue Section */}
                <div>
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-foreground serif">Continue <span className="text-primary italic">Learning</span></h2>
                            <div className="w-12 h-1 bg-primary/20 mt-2"></div>
                        </div>
                        <div className="flex gap-4">
                            <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
                                <Icon icon="solar:alt-arrow-left-linear" size={20} />
                            </button>
                            <button className="w-12 h-12 rounded-full bg-primary text-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <Icon icon="solar:alt-arrow-right-linear" size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {loading ? (
                            [1, 2].map((_, i) => (
                                <div key={i} className="bg-card p-6 rounded-3xl border border-border animate-pulse h-80"></div>
                            ))
                        ) : courses.length > 0 ? (
                            courses.slice(0, 2).map((course) => (
                                <div key={course._id} className="bg-card backdrop-blur-xl p-6 rounded-3xl border border-border hover:shadow-2xl transition-all group cursor-pointer premium-card" onClick={() => navigate(`/student/player/${course._id}`)}>
                                    <div className="h-48 bg-secondary rounded-2xl mb-6 relative overflow-hidden">
                                        <img src={course.thumbnail || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=500&auto=format&fit=crop"} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md p-3 rounded-full text-foreground hover:bg-background/40 transition-all">
                                            <Icon icon="solar:heart-bold" size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 inline-block italic serif">{course.category || "General"}</span>
                                        <h3 className="text-2xl font-black text-foreground mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 serif">{course.title}</h3>
                                        <div className="flex items-center justify-between border-t border-border pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold serif italic overflow-hidden">
                                                    {course.teacher?.avatar ? <img src={course.teacher.avatar} className="w-full h-full object-cover" /> : course.teacher?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground serif italic">{course.teacher?.name || "Instructor"}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Mentor</p>
                                                </div>
                                            </div>
                                            <Icon icon="solar:play-bold" className="text-primary" size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Refined statistics */}
            <div className="w-full lg:w-96 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
                {/* Profile/Stat Card */}
                <div className="bg-card backdrop-blur-xl rounded-3xl p-10 border border-border shadow-xl shadow-black/5 text-center relative overflow-hidden premium-card">
                    <div className="relative z-10">
                        <div className="relative inline-block mb-8">
                            <div className="w-32 h-32 rounded-full p-2 border-2 border-dashed border-primary/20 flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center text-primary overflow-hidden">
                                    {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <Icon icon="solar:user-circle-bold-duotone" size={80} />}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 right-2 bg-primary text-foreground text-xs font-black px-4 py-1.5 rounded-full shadow-lg border-4 border-card">
                                32%
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-foreground mb-4 serif">
                            {userData?.name || 'Student'} <Icon icon="solar:fire-bold" className="text-orange-500 inline-block align-text-bottom" />
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed px-4">
                           You're making incredible progress this week. Stay focused to reach your goals.
                        </p>
                    </div>
                    {/* Background flare */}
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                {/* Mentors Section */}
                <div className="px-2">
                    <div className="flex justify-between items-center mb-8 px-4">
                        <h3 className="text-xl font-black text-foreground serif">Top <span className="text-primary italic">Mentors</span></h3>
                        <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-all">
                            <Icon icon="solar:add-circle-linear" size={20} />
                        </button>
                    </div>

                    <div className="bg-card backdrop-blur-xl rounded-3xl p-8 border border-border shadow-xl shadow-black/5 space-y-8 premium-card">
                        {loading ? (
                            [1, 2].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-muted"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-muted rounded"></div>
                                        <div className="h-2 w-16 bg-muted rounded"></div>
                                    </div>
                                </div>
                            ))
                        ) : mentors.length > 0 ? (
                            mentors.slice(0, 3).map((mentor) => (
                                <div key={mentor._id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-primary border border-border overflow-hidden transition-transform group-hover:scale-110">
                                            {mentor.avatar ? <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" /> : <Icon icon="solar:user-circle-bold-duotone" size={32} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors serif italic">{mentor.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Master Mentor</p>
                                        </div>
                                    </div>
                                    <button className="text-primary hover:text-primary-hover transition-colors p-2 bg-primary/5 rounded-xl">
                                        <Icon icon="solar:user-plus-linear" size={20} />
                                    </button>
                                </div>
                            ))
                        ) : null}

                        <button className="w-full py-5 bg-primary/10 text-primary font-bold rounded-2xl text-xs hover:bg-primary/20 transition-all uppercase tracking-widest mt-4">
                            See All Mentors
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
