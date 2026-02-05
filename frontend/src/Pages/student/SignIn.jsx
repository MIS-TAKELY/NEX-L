import { Label } from "@/components/ui/label";
import { AppContext } from "@/context/AppContext";
import { getSession, loginWithGoogle, loginWithGithub, signIn } from "@/lib/auth.client";
import { cn } from "@/lib/utils";

import { verifyEmail } from "@/utils/verify-email";
import { Icon } from "@iconify/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        const userRole = session.user.role || "student";

        // Update AppContext with user data and role from backend
        login(userRole, session.user);

        console.log("Login success:", session);

        // Redirect based on role from backend
        if (userRole === "instructor") {
          navigate("/instructor/dashboard", { replace: true });
        } else if (userRole === 'admin') {
          navigate("/admin/dashboard", { replace: true });
        } else {
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
    <div className="min-h-screen flex font-outfit overflow-hidden">
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
      <div className="w-full lg:w-1/2 bg-card flex items-center justify-center p-4 md:p-6 relative">
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
            <h2 className="text-xl font-bold text-foreground dark:text-neutral-200">
              Sign In
            </h2>
            <p className="mt-1 text-sm text-muted-foreground dark:text-neutral-300">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="my-4">
            <div className="flex flex-col space-y-4">
              <LabelInputContainer>
                <Label className="text-base">Sign in as</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["student", "instructor", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold transition-all border capitalize",
                        role === r
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:border-primary/50",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="email" className="text-base">
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password" className="text-base">
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </LabelInputContainer>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-2 mb-4">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-muted-foreground hover:text-accent"
              >
                Forgot Password?
              </button>
            </div>

            <button
              className="group/btn relative block h-9 w-full rounded-md bg-primary text-primary-foreground font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="my-4 h-[1px] w-full bg-border" />

            <div className="flex flex-col space-y-4">
              <button
                className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                type="button"
              >
                <Icon icon="logos:github-icon" className="h-4 w-4" />
                <span className="text-sm text-muted-foreground dark:text-neutral-300">
                  GitHub
                </span>
              </button>
              <button
                className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                type="button"
              >
                <Icon icon="logos:google-icon" className="h-4 w-4" />
                <span className="text-sm text-muted-foreground dark:text-neutral-300">
                  Google
                </span>
              </button>
              <button
                className="group/btn shadow-input relative flex h-9 w-full items-center justify-start space-x-2 rounded-md bg-muted px-4 font-medium text-foreground dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                type="button"
              >
                <Icon icon="logos:facebook" className="h-4 w-4" />
                <span className="text-sm text-muted-foreground dark:text-neutral-300">
                  Facebook
                </span>
              </button>
            </div>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-accent font-semibold hover:underline"
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
