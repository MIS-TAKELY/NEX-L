import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Get all enrollments for a specific user
export const getUserEnrollments = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/enrollments/user/${userId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Enroll in a course
export const enrollInCourse = async (enrollData) => {
    try {
        const response = await axios.post(`${API_URL}/enrollments`, enrollData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
