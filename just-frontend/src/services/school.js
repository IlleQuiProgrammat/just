import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptSymmetric, generateKeypair, getServerPassword, base64EncArr, importEncodedPublicKey, getSymmetricEncryptionKey, encryptAsymmetric } from '../utils';

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
    getSchoolBySecret: builder.query({
      query: secret => `schools/${secret}`,
      providesTags: (result, error, args) => result ? [{ type: 'School', id: result.schoolId }] : [],
    }),
    createSchool: builder.mutation({
      query: school => ({
        url: 'schools',
        method: 'POST',
        body: school
      })
    }),
    startSchool: builder.mutation({
      queryFn: async ({ secret, email, password, tsAndCs }, api, options, baseQuery) => {
        let encoder = new TextEncoder();
        const salt = encoder.encode('Just-SALT-' + email);
        let serverPassword = await getServerPassword(password, salt);
        let userPassword = await getSymmetricEncryptionKey(password, salt);
        let keyPair = await generateKeypair();
        let publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        let privateKeyPlain = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        let iv = new Uint8Array(8);
        window.crypto.getRandomValues(iv);
        let privateKeyEncrypted = await encryptSymmetric(privateKeyPlain, userPassword, iv);
        let passExport = await window.crypto.subtle.exportKey("raw", serverPassword);
        let schoolKeyPair = await generateKeypair();
        let schoolPublic = await window.crypto.subtle.exportKey("spki", schoolKeyPair.publicKey);
        let schoolPrivateKeyExported = await window.crypto.subtle.exportKey("pkcs8", schoolKeyPair.privateKey);
        let schoolIV = new Uint8Array(8);
        window.crypto.getRandomValues(schoolIV);
        let schoolPrivateKeyEncrypted = await encryptAsymmetric(
          schoolPrivateKeyExported,
          keyPair.privateKey, 
          schoolKeyPair.publicKey,
          schoolIV
        );
        return baseQuery({
          url: `schools/${secret}`,
          method: 'POST',
          body: {
            publicKey: base64EncArr(publicKey),
            privateKey: base64EncArr(privateKeyEncrypted),
            iv: base64EncArr(iv),
            email, 
            tsAndCs, 
            password: base64EncArr(passExport),
            schoolPublicKey: base64EncArr(schoolPublic),
            schoolPrivateKey: base64EncArr(schoolPrivateKeyEncrypted),
            schoolPrivateKeyIV: base64EncArr(schoolIV)
          }
        })
      }
    }),
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
      invalidatesTags: (result, error, args) => [{ type: 'User', id: args.userId }]
    }),
    demoteUser: builder.mutation({
      query: userId => ({
        url: `schools/demote/${userId}`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, args) => [{ type: 'User', id: args }]
    }),
  })
});

export const {
  useGetSchoolSettingsQuery,
  useGetSchoolUsersQuery,
  usePromoteUserMutation,
  useDemoteUserMutation,
  useGetSchoolBySecretQuery,
  useStartSchoolMutation,
  useCreateSchoolMutation,
} = schoolApi;
