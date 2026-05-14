import {
  Award,
  BookOpen,
  Globe,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import { buildCourseInsights, compactNumber } from "@/lib/siteInsights";
import { useGetPublicCoursesQuery } from "@/store/slices/siteApi";

/* ─── Data ──────────────────────────────────────────────── */
const team = [
  {
    name: "Sachin Sharma",
    role: "Backend Developer",
    bio: "Passionate about building scalable and robust backend systems to power NEXL.",
    initials: "SS",
  },
  {
    name: "Prashiksha Shrestha",
    role: "Frontend Developer",
    bio: "Creating intuitive, responsive, and engaging user experiences for our learners.",
    initials: "PS",
  },
  {
    name: "Sidhant Dhungel",
    role: "Backend Developer",
    bio: "Developing secure and high-performance server-side applications.",
    initials: "SS",
  },
];

const values = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Mission-Driven",
    desc: "Every decision we make is guided by our mission to make quality education accessible to everyone.",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Innovation First",
    desc: "We continuously evolve our platform, integrating the latest technology to enhance learning outcomes.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Student-Centric",
    desc: "Students are at the heart of everything we build — from course design to platform features.",
  },
];

/* ─── Component ──────────────────────────────────────────── */
const AboutPage = () => {
  const navigate = useNavigate();
  const { data: courses = [] } = useGetPublicCoursesQuery();
  const insights = buildCourseInsights(courses);
  const stats = [
    { icon: <Users className="w-7 h-7" />, value: compactNumber(insights.totalReviews), label: "Learner Reviews" },
    { icon: <BookOpen className="w-7 h-7" />, value: compactNumber(insights.totalCourses), label: "Courses Available" },
    { icon: <Award className="w-7 h-7" />, value: compactNumber(insights.totalInstructors), label: "Expert Instructors" },
    { icon: <Globe className="w-7 h-7" />, value: compactNumber(insights.totalCategories), label: "Active Categories" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background font-outfit text-gray-800">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        className="relative w-full h-105 flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d1f30 0%, #1B3452 50%, #2a4f78 100%)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-background/5 rounded-md -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-background/5 rounded-md translate-x-1/3 translate-y-1/3 blur-3xl" />

        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 text-center select-none">
          <p className="text-primary-foreground/50 tracking-[0.3em] uppercase text-sm mb-3">
            — &nbsp; Learn More &nbsp; —
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 drop-shadow-lg">
            About Us
          </h1>
          <div className="w-16 h-1 bg-background/50 mx-auto rounded-md" />
        </div>
      </div>

      {/* ── INTRO 3-COLUMN ───────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10 items-start">
          {/* left */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Nepal's Premier E-Learning Platform
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              NEXL was born from a simple belief: every learner in Nepal deserves access to
              world-class education, regardless of location or background. Since our founding
              we have partnered with industry-leading instructors to deliver courses that are
              practical, affordable and career-changing.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm mt-4">
              From coding and design to business and language, our library spans dozens of
              disciplines — all crafted to help you succeed in the rapidly evolving digital economy.
            </p>
            <button
              onClick={() => navigate("/course-list")}
              className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-semibold text-sm hover:bg-primary-hover transition-colors duration-200 shadow-md"
            >
              Explore Courses
            </button>
          </div>

          {/* centre image card */}
          <div className="lg:col-span-1 flex justify-center">
            <div
              className="w-full max-w-xs rounded-md overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(160deg, #1B3452 0%, #2a4f78 60%, #3a6fa0 100%)",
                minHeight: "260px",
              }}
            >
              <div className="h-full flex flex-col items-center justify-center gap-4 py-12 px-8 text-center">
                <div className="w-20 h-20 rounded-md bg-background/20 flex items-center justify-center text-primary-foreground">
                  <BookOpen className="w-10 h-10" />
                </div>
                <p className="text-primary-foreground/90 font-semibold text-lg leading-snug">
                  Empowering Minds,<br />Building Futures
                </p>
                <p className="text-primary-foreground/60 text-xs">
                  Since 2082 · Itahari, Nepal
                </p>
              </div>
            </div>
          </div>

          {/* right */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Heritage &amp; Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
             NEXL was born in a small co-working space, built by passionate developers united by a shared commitment to quality, inclusivity, and lasting impact.


            </p>
            <p className="text-muted-foreground leading-relaxed text-sm mt-4">
              We imagine a Nepal where opportunities are not limited by skill gaps, and where continuous learning empowers individuals to grow, adapt, and succeed throughout their lives.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section className="py-14 bg-[#455672]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-md bg-background/15 flex items-center justify-center text-primary-foreground">
                {s.icon}
              </div>
              <p className="text-3xl font-bold text-primary-foreground">{s.value}</p>
              <p className="text-primary-foreground/70 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR VALUES ───────────────────────────────────── */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-md bg-primary/10 text-primary border border-primary/20">
              What We Stand For
            </span>
            <h2 className="text-3xl font-bold text-gray-800">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-background rounded-md p-7 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP / TEAM ────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-md bg-primary/10 text-primary border border-primary/20">
              The People Behind NEXL
            </span>
            <h2 className="text-3xl font-bold text-gray-800">Team Members</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-background rounded-md p-7 shadow-sm border border-border flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* avatar */}
                <div className="w-20 h-20 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                  {member.initials}
                </div>
                <p className="text-xs text-primary font-semibold tracking-widest uppercase mb-1">
                  {member.role}
                </p>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{member.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#455672]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Join thousands of learners already building their future with NEXL.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-background text-primary font-bold rounded-md hover:bg-secondary transition-colors duration-200 shadow-md"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3 border-2 border-white/40 text-primary-foreground font-semibold rounded-md hover:bg-background/10 transition-colors duration-200"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
