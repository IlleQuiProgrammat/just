import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { encryptSymmetric, generateKeypair, getServerPassword, base64EncArr, base64DecToArr, importEncodedPublicKey, getSymmetricEncryptionKey, importEncEncPrivateKey, decryptAsymmetric, importPrivateKeyBytes, getCachedSymmetricEncryptionKey, encryptAsymmetric } from '../utils';

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
    getKeys: builder.query({
      queryFn: async (args, api, options, baseQuery) => {
          const { data, error } = await baseQuery('auth');
          if (error) return { error };
          const publicKey = await importEncodedPublicKey(data.publicKey);
          const schoolPublicKey = await importEncodedPublicKey(data.schoolPublicKey);
          const privateKeyIV = base64DecToArr(data.privateKeyIV);
          const schoolPrivateKeyIV = data.schoolPrivateKeyIV?.length > 0 ? base64DecToArr(data.schoolPrivateKeyIV) : null;
          const symmetricEncryptionKey = await getCachedSymmetricEncryptionKey();
          const privateKey = await importEncEncPrivateKey(data.privateKey, symmetricEncryptionKey, privateKeyIV);
          let schoolPrivateKey = null;
          if (data.schoolPrivateKey?.length > 0 && schoolPrivateKeyIV !== null) {
            const encSchoolPrivateKey = base64DecToArr(data.schoolPrivateKey);
            const privateKeyBytes = await decryptAsymmetric(encSchoolPrivateKey, privateKey, schoolPublicKey, schoolPrivateKeyIV)
            schoolPrivateKey = await importPrivateKeyBytes(privateKeyBytes);
          }
          const keys = {
            publicKey,
            schoolPublicKey,
            privateKeyIV,
            schoolPrivateKeyIV,
            symmetricEncryptionKey,
            privateKey,
            schoolPrivateKey
          };
          return { data: keys }
      },
      providesTags: () => [{ type: 'Signin', id: 'Keys' }]
    }),
    login: builder.mutation({
      queryFn: async ({ email, password }, api, options, baseQuery) => {
        let encoder = new TextEncoder();
        const salt = encoder.encode('Just-SALT-' + email);
        let serverPassword = await getServerPassword(password, salt);
        let userPassword = await getSymmetricEncryptionKey(password, salt);
        let passExport = await window.crypto.subtle.exportKey("raw", serverPassword);
        let userPassExport = await window.crypto.subtle.exportKey("raw", userPassword)
        let { data, error } = await baseQuery({
          url: 'auth/login',
          method: 'POST',
          body: {
            userName: email,
            password: base64EncArr(passExport)
          }
        })
        if (error) return { error }
        localStorage.setItem('symenc', base64EncArr(userPassExport))
        return { data }
      },
      invalidatesTags: () => [{ type: 'Signin', id: 'status' }, { type: 'Signin', id: 'Keys' }]
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      invalidatesTags: () => [{ type: 'Signin', id: 'status' }, { type: 'Signin', id: 'Keys' }]
    }),
    register: builder.mutation({
      /* In the future we will need to provide:
       *  - hashed password
       *  - public key
       *  - encrypted private key
       *  - IV for encryption
       */
      queryFn: async ({ email, password, tsAndCs }, api, options, baseQuery) => {
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
        let potentialSchoolKeyPair = await generateKeypair();
        let potentialSchoolPublic = await window.crypto.subtle.exportKey("spki", potentialSchoolKeyPair.publicKey);
        let potentialSchoolPrivateKeyExported = await window.crypto.subtle.exportKey("pkcs8", potentialSchoolKeyPair.privateKey);
        let schoolIV = new Uint8Array(8);
        window.crypto.getRandomValues(schoolIV);
        let potentialSchoolPrivateKeyEncrypted = await encryptAsymmetric(
          potentialSchoolPrivateKeyExported,
          keyPair.privateKey, 
          potentialSchoolKeyPair.publicKey,
          schoolIV
        );
        return baseQuery({
          url: 'auth/register',
          method: 'POST',
          body: {
            publicKey: base64EncArr(publicKey),
            privateKey: base64EncArr(privateKeyEncrypted),
            iv: base64EncArr(iv),
            email, 
            tsAndCs, 
            password: base64EncArr(passExport),
            potentialSchoolPublicKey: base64EncArr(potentialSchoolPublic),
            potentialSchoolPrivateKey: base64EncArr(potentialSchoolPrivateKeyEncrypted),
            potentialSchoolPrivateKeyIV: base64EncArr(schoolIV)
          }
        })
      }
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
  useGetKeysQuery,
} = authApi;
