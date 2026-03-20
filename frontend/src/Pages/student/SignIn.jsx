import { Label } from "@/components/ui/label";
import { getSession, loginWithGithub, loginWithGoogle, signIn } from "@/lib/auth.client";
import { cn } from "@/lib/utils";

import { setCredentials } from "@/store/slices/authSlice";
import { verifyEmail } from "@/utils/verify-email";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logoo.png";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

        // Update Redux state with user data and role from backend
        // Serialize userData to avoid non-serializable value warning in Redux
        const serializedUser = JSON.parse(JSON.stringify(session.user));
        dispatch(setCredentials({ role: userRole, userData: serializedUser }));

        console.log("Login success:", session);

        // Redirect based on role from backend
        if (userRole === "instructor") {
          navigate("/instructor/dashboard", { replace: true });
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
        {/* Dynamic Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-100 dark:from-[#0f0f17] dark:to-[#0a0a0f]" />
        
        {/* Abstract lines decoration */}
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />
        <div className="absolute bottom-24 left-24 w-48 h-48 border border-white/10 rounded-lg transform rotate-12" />

        <div className="relative z-10 mb-20">
          

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
            className="h-full w-full fill-background"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path d="M0 0 C 40 10 40 30 20 50 C 0 70 0 90 20 100 L 100 100 L 100 0 Z" />
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-background flex flex-col justify-center p-4 md:p-6 relative">
        {/* New Top Left Arrow Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 text-foreground/60 hover:text-foreground hover:bg-muted rounded-full transition-all flex items-center justify-center"
        >
          <Icon icon="solar:arrow-left-linear" className="w-6 h-6" />
        </button>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 lg:hidden mb-8 mt-12">
            <img src={logo} alt="N" className="h-8 w-auto" />
            <h1 className="text-3xl font-bold text-primary">EXL</h1>
          </div>

          <div className="text-left mb-6">
            <h2 className="text-xl font-bold text-foreground">Sign In</h2>
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
                        "py-2 px-3 rounded-md text-xs font-bold transition-all border capitalize",
                        role === r
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
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
                  className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password" className="text-base text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="flex h-12 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center"
                  >
                    <Icon
                      icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                      className="w-5 h-5 opacity-70"
                    />
                  </button>
                </div>
              </LabelInputContainer>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm my-4">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-2 mb-4">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              className="relative block h-11 w-full rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-border" />
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                or continue with
              </span>
              <div className="h-[1px] flex-1 bg-border" />
            </div>
          </form>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => loginWithGithub(role)}
              className="flex h-11 items-center justify-center rounded-xl bg-card border border-border hover:bg-muted transition-all active:scale-[0.98]"
              type="button"
            >
              <Icon icon="mdi:github" className="h-6 w-6 text-foreground" />
            </button>
            <button
              onClick={() => loginWithGoogle(role)}
              className="flex h-11 items-center justify-center rounded-xl bg-card border border-border hover:bg-muted transition-all active:scale-[0.98]"
              type="button"
            >
              <Icon icon="logos:google-icon" className="h-5 w-5" />
            </button>
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>

          {/* Bottom Right Decoration */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary rounded-full hidden md:block opacity-10"></div>
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
