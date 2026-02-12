import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    userRole: localStorage.getItem('userRole') || null,
    userData: (() => {
        try {
            const stored = localStorage.getItem('userData');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    })(),
    loading: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { role, userData } = action.payload;
            // Ensure userData is serializable (e.g. better-auth might return Date objects)
            const serializedUserData = JSON.parse(JSON.stringify(userData));
            state.isLoggedIn = true;
            state.userRole = role;
            state.userData = serializedUserData;
            state.loading = false;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', role);
            localStorage.setItem('userData', JSON.stringify(serializedUserData));
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.userRole = null;
            state.userData = null;
            state.loading = false;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
        },
        updateUser: (state, action) => {
            const updated = { ...state.userData, ...action.payload };
            const serialized = JSON.parse(JSON.stringify(updated));
            state.userData = serialized;
            localStorage.setItem('userData', JSON.stringify(serialized));
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setCredentials, logout, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
