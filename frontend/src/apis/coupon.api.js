import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

export const createCoupon = async (couponData) => {
    try {
        const response = await axios.post(`${API_URL}/coupons`, couponData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getCourseCoupons = async (courseId) => {
    try {
        const response = await axios.get(`${API_URL}/coupons/course/${courseId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCoupon = async (id, couponData) => {
    try {
        const response = await axios.put(`${API_URL}/coupons/${id}`, couponData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCoupon = async (id, teacherId) => {
    try {
        const response = await axios.delete(`${API_URL}/coupons/${id}?teacherId=${teacherId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const validateCoupon = async (code, courseId) => {
    try {
        const response = await axios.post(`${API_URL}/coupons/validate`, { code, courseId }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
