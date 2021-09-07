import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { base64EncArr, generateKeypair, encryptAsymmetric, encryptSymmetric, base64DecToArr, importEncodedPublicKey, importEncEncPrivateKey, getCachedSymmetricEncryptionKey, decryptAsymmetric } from '../utils';

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
      // TODO: decrypt all the things
      queryFn: async ({ reportId, schoolPublicKey, schoolPrivateKey, isSchool}, api, options, baseQuery) => {
        const { data, error } = await baseQuery(`reports/${reportId}`);
        if (error) return { error }
        let publicKey;
        let privateKey;
        let studentPrivateKey;
        let studentPublicKey;
        const iv = base64DecToArr(data.iv);
        if (isSchool) {
          privateKey = schoolPrivateKey;
          publicKey = await importEncodedPublicKey(data.studentPublicKey);
          studentPublicKey = publicKey;
        } else {
          var symmetricKey = await getCachedSymmetricEncryptionKey();
          privateKey = await importEncEncPrivateKey(data.studentPrivateKey, symmetricKey, iv);
          publicKey = schoolPublicKey;
          studentPrivateKey = privateKey;
        }
        var cipherText = base64DecToArr(data.responseContent);
        var decoder = new TextDecoder()
        var responseContent = decoder.decode(await decryptAsymmetric(cipherText, privateKey, publicKey, iv));
        var messages = [];
        for (let i = 0; i < data.messages.length; i++) {
          if (data.messages[i].iv == null || data.messages[i].contents == null) {
            messages.push(data.messages[i]);
          } else {
            const messageCipherText = base64DecToArr(data.messages[i].contents);
            const messageIV = base64DecToArr(data.messages[i].iv);
            const decryptedMessage = await decryptAsymmetric(messageCipherText, privateKey, publicKey, messageIV);
            const decodedMessage = decoder.decode(decryptedMessage);
            messages.push({...data.messages[i], contents: decodedMessage});
          }
        }
        return { data: { ...data, responseContent, messages, studentPublicKey, studentPrivateKey } }
      },
      providesTags: (result, error, args) => [{ type: 'Report', id: args.reportId }],
      invalidatesTags: (result, error, args) => [{ type: 'ShortReport', id: args.reportId }]
    }),
    getShortReports: builder.query({
      query: () => `reports/list`,
      providesTags: (result, error, args) => 
        result ? [
          ...result.map(({ reportId }) => ({ type: 'ShortReport', id: reportId })),
          { type: 'ShortReport', id: 'LIST' }
        ] : [{ type: 'ShortReport', id: 'LIST' }]
    }),
    // TODO: Encrypt all the things
    createReport: builder.mutation({
      queryFn: async ({ formId, title, responseContent, schoolPublicKey, symmetricEncryptionKey }, api, options, baseQuery) => {
        let keyPair = await generateKeypair();
        let publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        let privateKeyPlain = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        let iv = new Uint8Array(8);
        window.crypto.getRandomValues(iv);
        let privateKeyEncrypted = await encryptSymmetric(privateKeyPlain, symmetricEncryptionKey, iv);
        const encoder = new TextEncoder();
        let encryptedResponseContent = await encryptAsymmetric(encoder.encode(responseContent), keyPair.privateKey, schoolPublicKey, iv);
        return await baseQuery({
          url: 'reports/',
          method: 'POST',
          body: {
            formId,
            title,
            responseContent: base64EncArr(encryptedResponseContent),
            studentPublicKey: base64EncArr(publicKey),
            studentPrivateKey: base64EncArr(privateKeyEncrypted),
            iv: base64EncArr(iv),
          }
        });
      },
      invalidatesTags: [{ type: 'ShortReport', id: 'LIST' }]
    }),
    // TODO: Encrypt all the things
    sendMessage: builder.mutation({
      queryFn: async ({
        reportId,
        schoolPublicKey,
        schoolPrivateKey,
        studentPublicKey,
        studentPrivateKey,
        isSchool,
        messageContent
      }, api, options, baseQuery) => {
        let publicKey;
        let privateKey;
        const encoder = new TextEncoder();
        let iv = new Uint8Array(8);
        window.crypto.getRandomValues(iv);
        if (isSchool) {
          privateKey = schoolPrivateKey;
          publicKey = studentPublicKey;
        } else {
          privateKey = studentPrivateKey;
          publicKey = schoolPublicKey;
        }
        const messageContentBuffer = await encryptAsymmetric(
          encoder.encode(messageContent),
          privateKey,
          publicKey,
          iv
        );
        const messageContentCipherText = base64EncArr(messageContentBuffer);
        const ivEncoded = base64EncArr(iv);
        return await baseQuery({
          url: `reports/${reportId}`,
          method: 'POST',
          body: {
            contents: messageContentCipherText,
            iv: ivEncoded
          }
        })
      },
      // TODO: Split messaging from reports
      invalidatesTags: (result, error, args) => [{ type: 'Report', id: args.reportId }]
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
