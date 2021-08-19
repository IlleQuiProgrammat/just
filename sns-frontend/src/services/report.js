import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const reportApi = createApi({
  reducerPath: 'reportApi',
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
  tagTypes: ['ShortReport', 'Report'],
  endpoints: (builder) => ({
    getReportById: builder.query({
      query: id => `reports/${id}`,
      providesTags: (result, error, args) => [{ type: 'Report', id: args }],
      invalidatesTags: (result, error, args) => [{ type: 'ShortReport', id: args }]
    }),
    getShortReports: builder.query({
      query: () => `reports/list`,
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ reportId }) => ({ type: 'ShortReport', id: reportId })),
          { type: 'ShortReport', id: 'LIST' }
        ] : [{ type: 'ShortReport', id: 'LIST' }]
    }),
    createReport: builder.mutation({
      query: report => ({
        url: 'reports/',
        method: 'POST',
        body: report
      }),
      invalidatesTags: [{ type: 'ShortReport', id: 'LIST' }]
    }),
    sendMessage: builder.mutation({
      query: ({ id, messageContent }) => ({
        url: `reports/${id}`,
        method: 'POST',
        body: messageContent
      }),
      // TODO: Split messaging from reports
      invalidatesTags: (result, error, args) => [{ type: 'Report', id: args.id }]
    }),
    changeReportStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `reports/${id}`,
        method: 'PUT',
        body: status
      }),
      invalidatesTags: (result, error, args) => [{ type: 'ShortReport', id: args.id }, { type: 'Report', id: args.id }]
    })
  })
})

export const {
  useGetReportByIdQuery,
  useGetShortReportsQuery,
  useCreateReportMutation,
  useSendMessageMutation,
  useChangeReportStatusMutation
} = reportApi;
