// Removed generic Input import to use standard input for full control
import { Label } from "@/components/ui/label";
import {
    getSession,
    loginWithGithub,
    loginWithGoogle,
    mergeRole,
    signUp,
} from "@/lib/auth.client";
import { getAuthErrorMessage, isUserAlreadyExistsError } from "@/utils/auth-errors";
import { verifyEmail, verifyPhoneOptional } from "@/utils/verify-email";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailTrimmed = formData.email.trim().toLowerCase();
    if (!verifyEmail(emailTrimmed)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const first = formData.firstName.trim();
    const last = formData.lastName.trim();
    if (!first || !last) {
      setError("Please enter your first and last name");
      setLoading(false);
      return;
    }

    if (!verifyPhoneOptional(formData.phoneNumber)) {
      setError("Enter a valid phone number (8–15 digits), or leave the field empty");
      setLoading(false);
      return;
    }

    if (formData.createNewPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.createNewPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (formData.createNewPassword.length > 128) {
      setError("Password must be at most 128 characters long");
      setLoading(false);
      return;
    }

    try {
      setSuccessMessage("");
      const fullName = `${first} ${last}`.trim();
      const callbackURL = `${window.location.origin}/login`;
      let signupData;
      try {
        signupData = await signUp(
          emailTrimmed,
          formData.createNewPassword,
          fullName,
          role,
          callbackURL,
        );
      } catch (signErr) {
        if (isUserAlreadyExistsError(signErr)) {
          try {
            const merged = await mergeRole(emailTrimmed, formData.createNewPassword, role);
            if (merged?.alreadyHadRole) {
              setError("You already have this role for this account. Sign in instead.");
              return;
            }
            setError("");
            setSuccessMessage(
              "That email already had an account — we added this role. You can sign in with your password.",
            );
            return;
          } catch (mergeErr) {
            const msg = mergeErr?.message || "";
            if (mergeErr?.status === 401) {
              setError(
                "This email is already registered. Enter your account password to add this role, or sign in.",
              );
              return;
            }
            if (msg.toLowerCase().includes("social")) {
              setError(msg);
              return;
            }
            setError("An account with this email already exists. Sign in instead.");
            return;
          }
        }
        throw signErr;
      }

      // With requireEmailVerification, the API returns token: null and does not create a session.
      if (!signupData?.token) {
        setShowVerifyModal(true);
        return;
      }

      const session = await getSession();
      if (session?.user) {
        const userRole = session.user.role || role;
        const serializedUser = JSON.parse(JSON.stringify(session.user));
        dispatch(setCredentials({ role: userRole, userData: serializedUser }));

        if (userRole === "instructor") {
          navigate("/instructor/dashboard", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } else {
        setError("Account created but we could not start your session. Please sign in.");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError(getAuthErrorMessage(error) || "Sign up failed. Try again.");
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
          {/* <button
            onClick={() => navigate(-1)}
            className="absolute -top-32 left-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-medium backdrop-blur-sm border border-white/20 shadow-sm"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" /> go back
          </button> */}

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
                  Phone number (optional)
                </Label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder=""
                  type="tel"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
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

            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-md text-sm my-4">
                {successMessage}
              </div>
            )}

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
      
      {/* Verify Email Modal */}
      <Dialog open={showVerifyModal} onOpenChange={(open) => {
        setShowVerifyModal(open);
        if (!open) navigate("/login");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Icon icon="solar:letter-opened-bold-duotone" className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Verify your email</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Registration successful! We've sent a verification link to <span className="font-semibold text-foreground">{formData.email}</span>.
              Please check your inbox and verify your email before signing in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <button
              onClick={() => {
                setShowVerifyModal(false);
                navigate("/login");
              }}
              className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Go to Login
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
