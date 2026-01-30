import { Route, Routes } from "react-router-dom";

// STUDENT PAGES
import Loading from "./components/student/Loading";
import LandingPage from "./Pages/LandingPage";
import CourseDetails from "./Pages/student/CourseDetails";
import CoursesList from "./Pages/student/CoursesList";
import Home from "./Pages/student/Home";
import MyEnrollments from "./Pages/student/MyEnrollments";
import Player from "./Pages/student/Player";
import SignIn from "./Pages/student/SignIn";
import SignUp from "./Pages/student/SignUp";

// INSTRUCTOR PAGES
import AddCourse from "./Pages/instructor/AddCourse";
import Dashboard from "./Pages/instructor/Dashboard";
import Instructor from "./Pages/instructor/Instructor";
import MyCourses from "./Pages/instructor/MyCourses";
import StudentsEnrolled from "./Pages/instructor/StudentsEnrolled";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/course-list" element={<CoursesList />} />
      <Route path="/course-list/:input" element={<CoursesList />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/my-enrollments" element={<MyEnrollments />} />
      <Route path="/player/:courseId" element={<Player />} />
      <Route path="/loading/:path" element={<Loading />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />


      <Route path="/instructor" element={<Instructor />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-course" element={<AddCourse />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="students-enrolled" element={<StudentsEnrolled />} />
      </Route>
    </Routes>
  );
}
