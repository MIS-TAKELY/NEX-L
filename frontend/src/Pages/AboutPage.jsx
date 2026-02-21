import {
  Award,
  BookOpen,
  Globe,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";

/* ─── Data ──────────────────────────────────────────────── */
const stats = [
  { icon: <Users className="w-7 h-7" />, value: "50,000+", label: "Students Enrolled" },
  { icon: <BookOpen className="w-7 h-7" />, value: "500+", label: "Courses Available" },
  { icon: <Award className="w-7 h-7" />, value: "200+", label: "Expert Instructors" },
  { icon: <Globe className="w-7 h-7" />, value: "40+", label: "Countries Reached" },
];

const team = [
  {
    name: "Sachin Sharma",
    role: "Backend Developer",
    bio: "Passionate about building scalable and robust backend systems to power NEX-L.",
    initials: "SS",
  },
  {
    name: "Prashiksha Shrestha",
    role: "Frontend Developer",
    bio: "Creating intuitive, responsive, and engaging user experiences for our learners.",
    initials: "PS",
  },
  {
    name: "Sidhant Shungel",
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

  return (
    <div className="min-h-screen bg-white font-outfit text-gray-800">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        className="relative w-full h-[420px] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d1f30 0%, #1B3452 50%, #2a4f78 100%)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

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
          <p className="text-white/50 tracking-[0.3em] uppercase text-sm mb-3">
            — &nbsp; Learn More &nbsp; —
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            About Us
          </h1>
          <div className="w-16 h-1 bg-white/50 mx-auto rounded-full" />
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
            <p className="text-gray-500 leading-relaxed text-sm">
              NEX-L was born from a simple belief: every learner in Nepal deserves access to
              world-class education, regardless of location or background. Since our founding
              we have partnered with industry-leading instructors to deliver courses that are
              practical, affordable and career-changing.
            </p>
            <p className="text-gray-500 leading-relaxed text-sm mt-4">
              From coding and design to business and language, our library spans dozens of
              disciplines — all crafted to help you succeed in the rapidly evolving digital economy.
            </p>
            <button
              onClick={() => navigate("/course-list")}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors duration-200 shadow-md"
            >
              Explore Courses
            </button>
          </div>

          {/* centre image card */}
          <div className="lg:col-span-1 flex justify-center">
            <div
              className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(160deg, #1B3452 0%, #2a4f78 60%, #3a6fa0 100%)",
                minHeight: "260px",
              }}
            >
              <div className="h-full flex flex-col items-center justify-center gap-4 py-12 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <BookOpen className="w-10 h-10" />
                </div>
                <p className="text-white/90 font-semibold text-lg leading-snug">
                  Empowering Minds,<br />Building Futures
                </p>
                <p className="text-white/60 text-xs">
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
            <p className="text-gray-500 leading-relaxed text-sm">
              Our journey began in a small co-working space with
              passionate developers guided by the  values that sparked it all:
              quality, inclusivity and impact.
            </p>
            <p className="text-gray-500 leading-relaxed text-sm mt-4">
              We envision a Nepal where skill gaps no longer determine someone's future, and
              where lifelong learning is the norm rather than the exception.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section className="py-14 bg-primary">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                {s.icon}
              </div>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-white/70 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR VALUES ───────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              What We Stand For
            </span>
            <h2 className="text-3xl font-bold text-gray-800">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP / TEAM ────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
              The People Behind NEX-L
            </span>
            <h2 className="text-3xl font-bold text-gray-800">Team Members</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
              >
                {/* avatar */}
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {member.initials}
                </div>
                <p className="text-xs text-primary font-semibold tracking-widest uppercase mb-1">
                  {member.role}
                </p>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{member.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-white/70 mb-8">
            Join thousands of learners already building their future with NEX-L.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-md"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors duration-200"
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
