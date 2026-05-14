import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { getUserEnrollments } from '../../apis/enrollment.api';
import { getMyBadges } from '../../apis/badge.api';
import { getStudentBatchBadges } from '@/lib/batches';

import StudentDashboardSkeleton from '../../components/skeletons/StudentDashboardSkeleton';

const Home = () => {
    const { userData } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [, setBatchBadgeTick] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userData?._id && !userData?.id) return;
            try {
                const [enrollmentsData, badgesData] = await Promise.all([
                    getUserEnrollments(userData._id || userData.id),
                    getMyBadges()
                ]);
                
                // Extract courses from enrollments
                const enrolledCourses = enrollmentsData.map(enrollment => ({
                    ...enrollment.course,
                    progress: enrollment.progress
                }));
                
                setCourses(enrolledCourses);
                setEarnedBadges(badgesData.data || []);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [userData]);

    useEffect(() => {
        const syncBatchBadges = () => setBatchBadgeTick((value) => value + 1);
        window.addEventListener("storage", syncBatchBadges);
        window.addEventListener("focus", syncBatchBadges);
        return () => {
            window.removeEventListener("storage", syncBatchBadges);
            window.removeEventListener("focus", syncBatchBadges);
        };
    }, []);

    if (loading) {
        return <StudentDashboardSkeleton />;
    }

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
    const batchBadges = getStudentBatchBadges(userData);
    const primaryBatchBadge = batchBadges[0];

    return (
        <div className="flex flex-col lg:flex-row gap-12 pt-8">

            {/* Middle Column - Main Content */}
            <div className="flex-1 flex flex-col gap-12">
                {/* Banner Section */}
                <div className="bg-primary/5 rounded-md p-10 md:p-12 relative overflow-hidden border border-primary/10">
                    <div className="relative z-10 max-w-xl">
                        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-4 serif italic">Welcome back, {userData?.name?.split(' ')[0] || 'Scholar'}</p>
                        <h1 className="text-4xl md:text-5xl font-black mb-8 leading-[1.1] text-foreground serif">
                           NEXL: Your Journey to <span className="text-primary italic">Mastery</span>
                        </h1>
                        <button 
                            onClick={() => navigate("/course-list")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-md font-bold text-base transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group"
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

                {batchBadges.length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-card rounded-md p-6 md:p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-md blur-3xl" />
                            <div className="absolute -bottom-14 -left-10 w-36 h-36 bg-primary/5 rounded-md blur-3xl" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-md bg-background/80 backdrop-blur flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg">
                                    <Icon icon="solar:layers-minimalistic-bold-duotone" size={28} />
                                </div>
                                <div className="max-w-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600 mb-2">
                                        Instant batch assignment
                                    </p>
                                    <h2 className="text-2xl md:text-3xl font-black text-foreground serif leading-tight">
                                        You have {batchBadges.length} batch badge{batchBadges.length === 1 ? "" : "s"} ready now.
                                    </h2>
                                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                                        Your instructor has already placed you into a cohort, so your badge collection updates instantly.
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {batchBadges.slice(0, 3).map((badge) => (
                                            <span
                                                key={badge.id}
                                                className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
                                            >
                                                <span className="text-base">{badge.icon}</span>
                                                {badge.batchName}
                                            </span>
                                        ))}
                                        {batchBadges.length > 3 && (
                                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                                                +{batchBadges.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                {primaryBatchBadge?.courseId ? (
                                    <button
                                        onClick={() => navigate(`/course/${primaryBatchBadge.courseId}`)}
                                        className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-opacity"
                                    >
                                        <Icon icon="solar:play-bold" size={18} />
                                        Open cohort course
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => navigate('/student/badges')}
                                    className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/20 bg-background/80 px-5 py-3 text-sm font-bold text-foreground hover:bg-background transition-colors"
                                >
                                    <Icon icon="solar:medal-ribbons-star-bold" size={18} />
                                    View badge details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Progress Highlights */}
                {courses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {courses.slice(0, 3).map((course) => (
                            <div key={course._id} className="bg-card backdrop-blur-xl p-6 rounded-md flex items-center justify-between border border-border hover:shadow-xl transition-all cursor-pointer group premium-card" onClick={() => navigate(`/student/player/${course._id}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center text-2xl">
                                        <Icon icon={getIcon(course.category)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">In Progress</p>
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[140px] serif italic">{course.title}</p>
                                    </div>
                                </div>
                                <Icon icon="solar:alt-arrow-right-linear" className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                )}


                {/* Featured / Continue Section */}
                {courses.length > 0 ? (
                    <div>
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-foreground serif">Continue <span className="text-primary italic">Learning</span></h2>
                                <div className="w-12 h-1 bg-primary/20 mt-2"></div>
                            </div>
                            <div className="flex gap-4">
                                <button className="w-10 h-10 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
                                    <Icon icon="solar:alt-arrow-left-linear" size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    <Icon icon="solar:alt-arrow-right-linear" size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {courses.slice(0, 2).map((course) => (
                                <div key={course._id} className="bg-card backdrop-blur-xl p-6 rounded-md border border-border hover:shadow-2xl transition-all group cursor-pointer premium-card" onClick={() => navigate(`/student/player/${course._id}`)}>
                                    <div className="h-48 bg-secondary rounded-md mb-6 relative overflow-hidden">
                                        <img src={course.thumbnail || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=500&auto=format&fit=crop"} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md p-2 rounded-md text-foreground hover:bg-background/40 transition-all">
                                            <Icon icon="solar:heart-bold" size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 inline-block italic serif">{course.category || "General"}</span>
                                        <h3 className="text-2xl font-black text-foreground mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 serif">{course.title}</h3>
                                        <div className="flex items-center justify-between border-t border-border pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold serif italic overflow-hidden">
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
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-card/50 backdrop-blur-xl p-12 rounded-md border border-dashed border-border text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-6 text-primary">
                            <Icon icon="solar:rocket-bold-duotone" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 serif">Ready to start your journey?</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            You haven't enrolled in any courses yet. Explore our catalog to find the perfect course for you.
                        </p>
                        <button 
                            onClick={() => navigate("/course-list")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-4 rounded-md font-bold transition-all shadow-xl shadow-primary/20"
                        >
                            Browse All Courses
                        </button>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Refined statistics */}
            <div className="w-full lg:w-96 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
                {/* Profile/Stat Card */}
                <div className="bg-card backdrop-blur-xl rounded-md p-8 border border-border shadow-xl shadow-black/5 text-center relative overflow-hidden premium-card">
                    <div className="relative z-10">
                        <div className="relative inline-block mb-8">
                            <div className="w-28 h-28 rounded-md p-2 border-2 border-dashed border-primary/20 flex items-center justify-center">
                                <div className="w-full h-full rounded-md bg-primary/5 flex items-center justify-center text-primary overflow-hidden">
                                    {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <Icon icon="solar:user-circle-bold-duotone" size={60} />}
                                </div>
                            </div>
                        <div className="absolute -bottom-2 right-2 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-md shadow-lg border-2 border-card">
                            {courses.length > 0 ? `${Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length)}%` : '0%'}
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
                    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/5 rounded-md blur-3xl"></div>
                </div>

                {/* Badges Widget */}
                <div className="px-2">
                    <div className="flex justify-between items-center mb-8 px-4">
                        <div>
                            <h3 className="text-xl font-black text-foreground serif">My <span className="text-primary italic">Badges</span></h3>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                                Earned + batch membership
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/student/badges')}
                            className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                            View All
                        </button>
                    </div>

                    <div className="bg-card backdrop-blur-xl rounded-md p-6 border border-border shadow-xl shadow-black/5 premium-card">
                        {loading ? (
                            <div className="grid grid-cols-4 gap-4 animate-pulse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-md bg-muted"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {batchBadges.length > 0 && (
                                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-11 h-11 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                                <Icon icon="solar:layers-minimalistic-bold-duotone" size={22} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Instant batch badge</p>
                                                <p className="text-sm font-bold text-foreground">{batchBadges.length} active</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {batchBadges.slice(0, 3).map((badge) => (
                                                <div
                                                    key={badge.id}
                                                    className="group relative w-14 h-14 rounded-md bg-background flex items-center justify-center text-2xl border border-emerald-500/20 hover:scale-110 transition-transform cursor-help"
                                                    title={badge.name}
                                                >
                                                    {badge.icon}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {badge.name}
                                                    </div>
                                                </div>
                                            ))}
                                            {batchBadges.length > 3 && (
                                                <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                                                    +{batchBadges.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {earnedBadges.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {earnedBadges.slice(0, 4).map((ub) => (
                                            <div
                                                key={ub._id}
                                                className="w-14 h-14 rounded-md bg-primary/5 flex items-center justify-center text-2xl border border-primary/10 hover:scale-110 transition-transform cursor-help group relative"
                                                title={ub.badge?.name}
                                            >
                                                {ub.badge?.icon || "🏅"}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                    {ub.badge?.name}
                                                </div>
                                            </div>
                                        ))}
                                        {earnedBadges.length > 4 && (
                                            <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                                                +{earnedBadges.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-muted-foreground mb-4">No earned badges yet. Keep learning!</p>
                                        <button
                                            onClick={() => navigate('/course-list')}
                                            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                                        >
                                            Explore Courses
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mentors Section */}
                <div className="px-2">
                    <div className="flex justify-between items-center mb-8 px-4">
                        <h3 className="text-xl font-black text-foreground serif">Top <span className="text-primary italic">Mentors</span></h3>
                        <button className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-all">
                            <Icon icon="solar:add-circle-linear" size={20} />
                        </button>
                    </div>

                    <div className="bg-card backdrop-blur-xl rounded-md p-8 border border-border shadow-xl shadow-black/5 space-y-8 premium-card">
                        {loading ? (
                            [1, 2].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-md bg-muted"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 bg-muted rounded-md"></div>
                                        <div className="h-2 w-16 bg-muted rounded-md"></div>
                                    </div>
                                </div>
                            ))
                        ) : mentors.length > 0 ? (
                            mentors.slice(0, 3).map((mentor) => (
                                <div key={mentor._id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center text-primary border border-border overflow-hidden transition-transform group-hover:scale-110">
                                            {mentor.avatar ? <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" /> : <Icon icon="solar:user-circle-bold-duotone" size={32} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors serif italic">{mentor.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Master Mentor</p>
                                        </div>
                                    </div>
                                    <button className="text-primary hover:text-primary-hover transition-colors p-2 bg-primary/5 rounded-md">
                                        <Icon icon="solar:user-plus-linear" size={20} />
                                    </button>
                                </div>
                            ))
                        ) : null}

                        <button className="w-full py-5 bg-primary/10 text-primary font-bold rounded-md text-xs hover:bg-primary/20 transition-all uppercase tracking-widest mt-4">
                            See All Mentors
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
