import { apiSlice } from "./apiSlice";

export const cartApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCart: builder.query({
            query: () => "/cart",
            providesTags: ["Cart"],
        }),
        addToCart: builder.mutation({
            query: (body) => ({
                url: "/cart/add",
                method: "POST",
                body,
            }),
            async onQueryStarted({ courseId, course }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData("getCart", undefined, (draft) => {
                        if (draft && draft.data) {
                            // Optimistically add to items
                            draft.data.items.push({ course });
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ["Cart"],
        }),
        removeFromCart: builder.mutation({
            query: (courseId) => ({
                url: `/cart/remove/${courseId}`,
                method: "DELETE",
            }),
            async onQueryStarted(courseId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    cartApi.util.updateQueryData("getCart", undefined, (draft) => {
                        if (draft && draft.data) {
                            // Optimistically remove from items
                            draft.data.items = draft.data.items.filter(
                                (item) => item.course._id !== courseId
                            );
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: ["Cart"],
        }),
        clearCart: builder.mutation({
            query: () => ({
                url: "/cart/clear",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi;
