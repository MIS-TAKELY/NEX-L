import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: localStorage.getItem('theme') || 'light',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', state.theme);
        }
    },
});

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
