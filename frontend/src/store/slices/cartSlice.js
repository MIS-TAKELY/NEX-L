import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // We still keep items for guest users or immediate feedback, 
    // but the source of truth will be the backend for logged-in users.
    items: (() => {
        try {
            const stored = localStorage.getItem('cart');
            const parsed = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    })(),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload;
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        addToCart: (state, action) => {
            const course = action.payload;
            if (!state.items.find((item) => item.id === course.id || item._id === course._id)) {
                state.items.push(course);
                localStorage.setItem('cart', JSON.stringify(state.items));
            }
        },
        removeFromCart: (state, action) => {
            const courseId = action.payload;
            state.items = state.items.filter((item) => item.id !== courseId && item._id !== courseId);
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        removeMultipleFromCart: (state, action) => {
            const courseIds = action.payload; // Array of course IDs
            state.items = state.items.filter((item) =>
                !courseIds.includes(item.id) && !courseIds.includes(item._id)
            );
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cart');
        }
    },
});

export const { setCart, addToCart, removeFromCart, removeMultipleFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
