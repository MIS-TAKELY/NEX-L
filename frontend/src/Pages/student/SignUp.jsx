// Removed generic Input import to use standard input for full control
import { Label } from "@/components/ui/label";
import {
    getSession,
    loginWithGithub,
    loginWithGoogle,
    signIn,
    signUp,
} from "@/lib/auth.client";
import { cn } from "@/lib/utils";
import { setCredentials } from "@/store/slices/authSlice";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logoo.png";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    createNewPassword: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (formData.createNewPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.createNewPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Create full name from first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      // Sign up with better-auth, including role
      await signUp(formData.email, formData.createNewPassword, fullName, role);

      // Automatically sign in after successful signup
      await signIn(formData.email, formData.createNewPassword);

      // Get session data
      const session = await getSession();

      if (session && session.user) {
        // Get role from backend session (more secure than client-side role)
        const userRole = session.user.role || role;

        // Update Redux state with user data
        // Serialize userData to avoid non-serializable value warning in Redux
        const serializedUser = JSON.parse(JSON.stringify(session.user));
        dispatch(setCredentials({ role: userRole, userData: serializedUser }));

        console.log("Signup and login success:", session);

        // Redirect based on role
        if (userRole === "instructor") {
          navigate("/instructor/dashboard", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } else {
        // Signup succeeded but login failed, redirect to login page
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Sign up failed. Email may already be in use.",
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
            Chase your <br />
            Dreams
          </h1>
          <p className="text-xl text-primary-foreground/80 tracking-wide font-light">
            grow with us
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

          <h2 className="text-xl font-bold text-foreground">
            Sign Up
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to get started
          </p>

          {/* Role Selection */}
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground/70 mb-3">I am a:</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${role === "student"
                  ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm shadow-primary/10"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                  }`}
              >
                <Icon icon="solar:user-id-linear" className="w-5 h-5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${role === "instructor"
                  ? "border-primary bg-primary/5 text-primary font-semibold shadow-sm shadow-primary/10"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                  }`}
              >
                <Icon icon="solar:teacher-linear" className="w-5 h-5" /> Instructor
              </button>
            </div>
          </div>

          <form className="my-6" onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <LabelInputContainer>
                  <Label htmlFor="firstName" className="text-sm text-foreground">
                    First name
                  </Label>
                  <input
                    id="firstName"
                    name="firstName"
                    placeholder="first name"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label htmlFor="lastName" className="text-sm text-foreground">
                    Last name
                  </Label>
                  <input
                    id="lastName"
                    name="lastName"
                    placeholder="last name"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  />
                </LabelInputContainer>
              </div>

              <LabelInputContainer>
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email Address
                </Label>
                <input
                  id="email"
                  name="email"
                  placeholder="123@gmail.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="phoneNumber" className="text-sm text-foreground">
                  Phone Number
                </Label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder=""
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                />
              </LabelInputContainer>

              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <LabelInputContainer>
                  <Label htmlFor="password" className="text-sm text-foreground">
                    Create Password
                  </Label>
                  <div className="relative">
                      <input
                        id="password"
                        name="createNewPassword"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={formData.createNewPassword}
                        onChange={handleChange}
                        required
                        className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground pr-10"
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

                <LabelInputContainer>
                  <Label htmlFor="confirmPassword" className="text-sm text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="flex h-11 w-full rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 flex items-center justify-center"
                      >
                        <Icon
                          icon={showConfirmPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                          className="w-5 h-5 opacity-70"
                        />
                      </button>
                  </div>
                </LabelInputContainer>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm my-4">
                {error}
              </div>
            )}

            <button
              className="relative block h-11 w-full rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign up"}
            </button>

            <div className="my-6 h-[1px] w-full bg-border" />

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => loginWithGithub(role)}
                className="flex h-11 w-full items-center justify-center space-x-2 rounded-xl bg-card border border-border hover:bg-muted transition-all active:scale-[0.98]"
                type="button"
              >
                <Icon icon="mdi:github" className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  GitHub
                </span>
              </button>
              <button
                onClick={() => loginWithGoogle(role)}
                className="flex h-11 w-full items-center justify-center space-x-2 rounded-xl bg-card border border-border hover:bg-muted transition-all active:scale-[0.98]"
                type="button"
              >
                <Icon icon="logos:google-icon" className="h-5 w-5" />
                <span className="text-sm font-medium text-foreground">
                  Google
                </span>
              </button>
            </div>
          </form>

          <p className="text-center text-muted-foreground text-sm mb-4">
            Have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
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

export default SignUp;
