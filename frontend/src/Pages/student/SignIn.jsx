import { Label } from "@/components/ui/label";
import { getSession, signIn } from "@/lib/auth.client";
import { cn } from "@/lib/utils";
import { verifyEmail } from "@/utils/verify-email";
import { Icon } from "@iconify/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!verifyEmail(formData.email)) {
      setError("Invalid email");
      setLoading(false);
      return;
    }

    try {
      // Sign in using better-auth client
      await signIn(formData.email, formData.password);

      // Get session data
      const session = await getSession();

      if (session && session.user) {
        // Get role from backend session (secure, server-side role)
        const userRole = session.user.role || 'student';

        // Update AppContext with user data and role from backend
        login(userRole, session.user);

        console.log("Login success:", session);

        // Redirect based on role from backend
        if (userRole === 'instructor') {
          navigate("/instructor/dashboard", { replace: true });
        }else {
          navigate("/student/dashboard", { replace: true });
        }
      } else {
        setError("Failed to retrieve session");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-outfit">
      {/* Left Side - Dark Background with Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-center px-12 md:px-20 text-primary-foreground overflow-hidden">
        {/* Abstract lines decoration */}
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        <div className="absolute bottom-24 left-24 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />

        <div className="relative z-10 mb-20">
          <button
            onClick={() => navigate(-1)}
            className="absolute -top-32 left-0 flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <Icon icon="solar:alt-arrow-left-linear" /> go back
          </button>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Welcome <br />
            Back
          </h1>
          <p className="text-xl text-primary-foreground/80 tracking-wide font-light">
            continue with us
          </p>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute top-0 right-0 bottom-0 w-24 translate-x-[1px] h-full pointer-events-none">
          <svg
            className="h-full w-full fill-white"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path d="M0 0 C 40 10 40 30 20 50 C 0 70 0 90 20 100 L 100 100 L 100 0 Z" />
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-4 md:p-6 relative">
        <div className="w-full max-w-md">
          {/* Mobile Back Button & Header */}
          <div className="lg:hidden mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              ← go back
            </button>
            <h1 className="text-3xl font-bold text-primary">NEXL</h1>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Sign In
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="my-4">
            <div className="flex flex-col space-y-4">
              <LabelInputContainer>
                <Label className="text-base text-foreground">Sign in as</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["student", "instructor"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold transition-all border capitalize",
                        role === r
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/50",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="email" className="text-base text-foreground">
                  Email or Phone Number
                </Label>
                <input
                  id="email"
                  name="email"
                  placeholder="123@gmail.com"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password" className="text-base text-foreground">
                  Password
                </Label>
                <input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </LabelInputContainer>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-md text-sm my-4">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-2 mb-4">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot Password?
              </button>
            </div>

            <button
              className="relative block h-10 w-full rounded-md bg-primary text-white font-medium shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="my-6 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-border" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">or continue with</span>
                <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                className="flex h-10 items-center justify-center rounded-md bg-card border border-border hover:bg-muted transition-colors"
                type="button"
              >
                <Icon icon="logos:github-icon" className="h-5 w-5" />
              </button>
              <button
                className="flex h-10 items-center justify-center rounded-md bg-card border border-border hover:bg-muted transition-colors"
                type="button"
              >
                <Icon icon="logos:google-icon" className="h-5 w-5" />
              </button>
              <button
                className="flex h-10 items-center justify-center rounded-md bg-card border border-border hover:bg-muted transition-colors"
                type="button"
              >
                <Icon icon="logos:facebook" className="h-5 w-5" />
              </button>
            </div>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>

          {/* Bottom Right Decoration */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary rounded-full hidden md:block opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default SignIn;
