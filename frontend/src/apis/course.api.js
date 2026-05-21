import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Create a new course (with optional nested structure)
export const createCourse = async (courseData) => {
    try {
        const response = await axios.post(`${API_URL}/courses`, courseData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Upload media file
export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(`${API_URL}/upload/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        });
        return response.data; // { url, public_id, format }
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
// Get instructor courses
export const getInstructorCourses = async (teacherId) => {
    try {
        const response = await axios.get(`${API_URL}/courses/instructor/${teacherId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
// Get single course by ID
export const getCourseById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/courses/${id}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update a course
export const updateCourse = async (id, courseData) => {
    try {
        const response = await axios.put(`${API_URL}/courses/${id}`, courseData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete a course
export const deleteCourse = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/courses/${id}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/courses`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// --- Quizzes & Assignments ---
export const createQuiz = async (quizData) => {
    try {
        const response = await axios.post(`${API_URL}/quizzes`, quizData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createAssignment = async (assignmentData) => {
    try {
        const response = await axios.post(`${API_URL}/assignments`, assignmentData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const submitQuizAttempt = async (quizId, submissionData) => {
    try {
        const response = await axios.post(`${API_URL}/quizzes/${quizId}/submit`, submissionData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const submitAssignment = async (assignmentId, submissionData) => {
    try {
        const response = await axios.post(`${API_URL}/assignments/${assignmentId}/submit`, submissionData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const resolveAssignmentByContent = async (contentId) => {
    try {
        const response = await axios.get(`${API_URL}/assignments/resolve/${contentId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
