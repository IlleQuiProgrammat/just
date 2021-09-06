import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const questionApi = createApi({
  reducerPath: 'questionApi',
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
  tagTypes: ['Question', 'ShortQuestion'],
  endpoints: (builder) => ({
    getQuestionById: builder.query({
      query: id => `questions/${id}`,
      providesTags: (result, error, args) => [{ type: 'Question', id: args }]
    }),
    getActiveShortQuestions: builder.query({
      query: () => 'questions/list',
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ questionId }) => ({ type: 'ShortQuestion', id: questionId })),
          { type: 'ShortQuestion', id: 'LIST' }
        ] : [{ type: 'ShortQuestion', id: 'LIST' }]
    }),
    getAllShortQuestions: builder.query({
      query: () => 'questions/list/all',
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ questionId }) => ({ type: 'ShortQuestion', id: questionId })),
          { type: 'ShortQuestion', id: 'LIST' }
        ] : [{ type: 'ShortQuestion', id: 'LIST' }]
    }),
    setQuestionActivity: builder.mutation({
      query: ({ questionId, activity }) => ({
        url: `questions/${questionId}/active`,
        method: 'PUT',
        body: activity
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortQuestion', id: args.questionId }]
    }),
    createQuestion: builder.mutation({
      query: question => ({
        url: 'questions/',
        method: 'POST',
        body: question
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortQuestion', id: 'LIST' }]
    }),
    editQuestion: builder.mutation({
      query: question => ({
        url: `questions/${question.questionId}`,
        method: 'PUT',
        body: question
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortQuestion', id: 'LIST' }]
    })
  })
})

export const {
  useGetQuestionByIdQuery,
  useGetActiveShortQuestionsQuery,
  useGetAllShortQuestionsQuery,
  useSetQuestionActivityMutation,
  useCreateQuestionMutation,
  useEditQuestionMutation
} = questionApi;
