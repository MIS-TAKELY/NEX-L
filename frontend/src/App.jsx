import { Route, Routes } from "react-router-dom";

// STUDENT PAGES
import Loading from "./components/student/Loading";
import LandingPage from "./Pages/LandingPage";
import Cart from "./Pages/student/Cart";
import CourseDetails from "./Pages/student/CourseDetails";
import CoursesList from "./Pages/student/CoursesList";
import ForgotPassword from "./Pages/student/ForgotPassword";
import Home from "./Pages/student/Home";
import MyEnrollments from "./Pages/student/MyEnrollments";
import PaymentGateway from "./Pages/student/PaymentGateway";
import Player from "./Pages/student/Player";
import SignIn from "./Pages/student/SignIn";
import SignUp from "./Pages/student/SignUp";
import StudentLayout from "./Pages/student/StudentLayout";

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

// ADMIN PAGES
import AdminLayout from "./Pages/admin/Admin";
import AdminCourses from "./Pages/admin/Courses";
import AdminDashboard from "./Pages/admin/Dashboard";
import AdminUsers from "./Pages/admin/Users";

import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/course-list" element={<CoursesList />} />
      <Route path="/course-list/:input" element={<CoursesList />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/payment-gateway" element={<PaymentGateway />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Cart />
        </ProtectedRoute>
      } />

      {/* STUDENT ROUTES */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="my-enrollments" element={<MyEnrollments />} />
        <Route path="player/:courseId" element={<Player />} />
        <Route path="cart" element={<Cart />} />
      </Route>

      {/* Legacy support for /home redirecting or same element */}
      <Route path="/home" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
      </Route>


      {/* INSTRUCTOR ROUTES */}
      <Route path="/instructor" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <Instructor />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="add-course" element={<AddCourse />} />
        <Route path="edit-course/:id" element={<EditCourse />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<InstructorSettings />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
      </Route>

      <Route path="/loading/:path" element={<Loading />} />
    </Routes>
  );
}
