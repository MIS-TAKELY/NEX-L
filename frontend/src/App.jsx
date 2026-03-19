import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";

// STUDENT PAGES
import Loading from "./components/student/Loading";
import AboutPage from "./Pages/AboutPage";
import ContactPage from "./Pages/ContactPage";
import LandingPage from "./Pages/LandingPage";
import LegalPolicy from "./Pages/LegalPolicy";
import Cart from "./Pages/student/Cart";
import CourseDetails from "./Pages/student/CourseDetails";
import ForgotPassword from "./Pages/student/ForgotPassword";
import Home from "./Pages/student/Home";
import MyEnrollments from "./Pages/student/MyEnrollments";
import PaymentFailure from "./Pages/student/PaymentFailure";
import PaymentGateway from "./Pages/student/PaymentGateway";
import PaymentMethodSelection from "./Pages/student/PaymentMethodSelection";
import PaymentSuccess from "./Pages/student/PaymentSuccess";
import Player from "./Pages/student/Player";
import StudentSettings from "./Pages/student/Settings";
import SignIn from "./Pages/student/SignIn";
import SignUp from "./Pages/student/SignUp";
import StudentLayout from "./Pages/student/StudentLayout";
import LiveStreamWatch from "./Pages/student/LiveStreamWatch";
import VideoCallPage from "./Pages/student/VideoCallPage";

const CoursesList = lazy(() => import("./Pages/student/CoursesList"));
const Search = lazy(() => import("./Pages/student/Search"));

// INSTRUCTOR PAGES
import AddCourse from "./Pages/instructor/AddCourse";
import Analytics from "./Pages/instructor/Analytics";
import Dashboard from "./Pages/instructor/Dashboard";
import EditCourse from "./Pages/instructor/EditCourse";
import Instructor from "./Pages/instructor/Instructor";
import Messages from "./Pages/instructor/Messages";
import MyCourses from "./Pages/instructor/MyCourses";
import InstructorSettings from "./Pages/instructor/Settings";
import Statistics from "./Pages/instructor/Statistics";
import LiveStreamBroadcast from "./Pages/instructor/LiveStreamBroadcast";

// ADMIN PAGES
import AdminLayout from "./Pages/admin/Admin";
import AdminCourses from "./Pages/admin/Courses";
import AdminDashboard from "./Pages/admin/Dashboard";
import AdminUsers from "./Pages/admin/Users";

import { getSession } from "@/lib/auth.client";
import { logout, setCredentials, setLoading } from "@/store/slices/authSlice";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import { StreamContextProvider } from "@/context/StreamContext";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Capture session token from URL if redirected from OAuth
        const params = new URLSearchParams(window.location.search);
        const sessionToken = params.get("session_token");
        if (sessionToken) {
          localStorage.setItem("session_token", sessionToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const session = await getSession();
        if (session && session.user) {
          const role = session.user.role || 'student';
          // Serialize userData to avoid non-serializable value warning in Redux
          const serializedUser = JSON.parse(JSON.stringify(session.user));
          dispatch(setCredentials({ role, userData: serializedUser }));
        } else {
          dispatch(logout());
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        dispatch(logout());
        dispatch(setLoading(false));
      }
    };

    verifySession();
  }, [dispatch]);
  return (
    <StreamContextProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy-policy" element={<LegalPolicy />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/search" element={<Search />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/payment-gateway" element={<PaymentGateway />} />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/payment-method-selection" element={<PaymentMethodSelection />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="my-enrollments" element={<MyEnrollments />} />
          <Route path="player/:courseId" element={<Player />} />
          <Route path="cart" element={<Cart />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

          {/* Student standalone communication pages */}
          <Route
            path="/student/live/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <LiveStreamWatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/video-call/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <VideoCallPage />
              </ProtectedRoute>
            }
          />

        {/* Legacy support for /home redirecting or same element */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
        </Route>

        {/* INSTRUCTOR ROUTES */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <Instructor />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<InstructorSettings />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="livestream/:courseId" element={<LiveStreamBroadcast />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
        </Route>

        <Route path="/loading/:path" element={<Loading />} />
        </Routes>
      </Suspense>
    </StreamContextProvider>
  );
}
