import { apiSlice } from "./apiSlice";

export const contactApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        sendContactForm: builder.mutation({
            query: (data) => ({
                url: "/contact",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useSendContactFormMutation } = contactApi;
