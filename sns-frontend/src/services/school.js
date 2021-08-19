import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const schoolApi = createApi({
  reducerPath: 'schoolApi',
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
  tagTypes: ['User', 'School'],
  endpoints: (builder) => ({
    getSchoolSettings: builder.query({
      query: () => "schools",
      providesTags: (result, error, args) => [{ type: 'School', id: result?.schoolId }]
    }),
    getSchoolUsers: builder.query({
      query: () => "schools/users",
      providesTags: (result, error, args) => result ? [
        ...result.map(({ id }) => ({ type: 'User', id: id })),
        { type: 'User', id: 'LIST' }
      ] : [{ type: 'User', id: 'LIST' }]
    }),
    promoteUser: builder.mutation({
      query: userId => ({
        url: `schools/promote/${userId}`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, args ) => [{ type: 'User', id: args }]
    }),
    demoteUser: builder.mutation({
      query: userId => ({
        url: `schools/demote/${userId}`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, args ) => [{ type: 'User', id: args }]
    }),
  })
});

export const {
  useGetSchoolSettingsQuery,
  useGetSchoolUsersQuery,
  usePromoteUserMutation,
  useDemoteUserMutation
} = schoolApi;
