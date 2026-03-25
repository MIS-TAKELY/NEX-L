import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Get all badges earned by the authenticated student
export const getMyBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/badges/my-badges`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get earned badges for a specific course
export const getMyBadgesForCourse = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/badges/my-badges/${courseId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all available badges for a course
export const getCourseBadges = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/badges/course/${courseId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Instructor: create a badge
export const createBadge = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/badges`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Instructor: get their own badges
export const getInstructorBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/badges/instructor`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Instructor: delete a badge
export const deleteBadge = async (badgeId) => {
  try {
    const response = await axios.delete(`${API_URL}/badges/${badgeId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
