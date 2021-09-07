import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const formApi = createApi({
  reducerPath: 'formApi',
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
  tagTypes: ['Form', 'ShortForm'],
  endpoints: (builder) => ({
    getFormById: builder.query({
      query: id => `forms/${id}`,
      providesTags: (result, error, args) => [{ type: 'Form', id: args }]
    }),
    getActiveShortForms: builder.query({
      query: () => 'forms/list',
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ formId }) => ({ type: 'ShortForm', id: formId })),
          { type: 'ShortForm', id: 'LIST' }
        ] : [{ type: 'ShortForm', id: 'LIST' }]
    }),
    getAllShortForms: builder.query({
      query: () => 'forms/list/all',
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ formId }) => ({ type: 'ShortForm', id: formId })),
          { type: 'ShortForm', id: 'LIST' }
        ] : [{ type: 'ShortForm', id: 'LIST' }]
    }),
    setFormActivity: builder.mutation({
      query: ({ formId, activity }) => ({
        url: `forms/${formId}/active`,
        method: 'PUT',
        body: activity
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortForm', id: args.formId }]
    }),
    createForm: builder.mutation({
      query: form => ({
        url: 'forms/',
        method: 'POST',
        body: form
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortForm', id: 'LIST' }]
    }),
    editForm: builder.mutation({
      query: form => ({
        url: `forms/${form.formId}`,
        method: 'PUT',
        body: form
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortForm', id: 'LIST' }]
    })
  })
})

export const {
  useGetFormByIdQuery,
  useGetActiveShortFormsQuery,
  useGetAllShortFormsQuery,
  useSetFormActivityMutation,
  useCreateFormMutation,
  useEditFormMutation
} = formApi;
