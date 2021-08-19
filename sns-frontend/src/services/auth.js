import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL,
    prepareHeaders: headers => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      headers.set('Sec-Fetch-Site', 'cross-site');
      return headers;
    },
    credentials: 'include'
  }),
  tagTypes: ['Signin'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: 'auth/login',
        method: 'POST',
        body: { userName: email, password }
      }),
      invalidatesTags: () => [{ type: 'Signin', id: 'status' }]
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      invalidatesTags: () => [{ type: 'Signin', id: 'status' }]
    }),
    register: builder.mutation({
      query: ({ email, password, tsAndCs }) => ({
        url: 'auth/register',
        method: 'POST',
        body: { email, password, tsAndCs }
      }),
    }),
    getSignInStatus: builder.query({
      query: () => 'auth/status',
      providesTags: () => [{ type: 'Signin', id: 'status' }],
      keepUnusedDataFor: 60 * 60
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetSignInStatusQuery,
} = authApi;
