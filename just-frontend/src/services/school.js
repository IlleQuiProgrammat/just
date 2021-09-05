import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { base64EncArr, encryptAsymmetric, importEncodedPublicKey } from '../utils';

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
      queryFn: async ({ userId, encodedUserPublicKey, schoolPrivateKey }, api, options, baseQuery) => {
        let iv = new Uint8Array(8);
        window.crypto.getRandomValues(iv);
        let schoolPrivateKeyData = await window.crypto.subtle.exportKey("pkcs8", schoolPrivateKey);
        let userPublicKey = await importEncodedPublicKey(encodedUserPublicKey);
        let encryptedSchoolPrivateKeyData = await encryptAsymmetric(
          schoolPrivateKeyData,
          schoolPrivateKey,
          userPublicKey,
          iv
        )
        return await baseQuery({
          url: `schools/promote/${userId}`,
          method: 'PUT',
          body: {
            privateKey: base64EncArr(encryptedSchoolPrivateKeyData),
            privateKeyIV: base64EncArr(iv),
          }
        })
      },
      invalidatesTags: (result, error, args ) => [{ type: 'User', id: args.userId }]
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
