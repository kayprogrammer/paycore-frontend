import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types/common';
import type {
  KYCVerification,
  SubmitKYCRequest,
  CurrentKYCLevel,
} from '../types';

export const complianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Submit KYC
    submitKYC: builder.mutation<ApiResponse<KYCVerification>, SubmitKYCRequest>({
      query: (data) => {
        const formData = new FormData();

        // Append text fields
        formData.append('level', data.level);
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('date_of_birth', data.date_of_birth);
        formData.append('address_line_1', data.address_line_1);
        if (data.address_line_2) formData.append('address_line_2', data.address_line_2);
        formData.append('city', data.city);
        formData.append('state', data.state);
        formData.append('postal_code', data.postal_code);
        formData.append('country', data.country);
        formData.append('id_type', data.id_type);
        formData.append('id_number', data.id_number);

        // Append document files
        formData.append('id_document', data.documents.id_document);
        formData.append('selfie', data.documents.selfie);
        if (data.documents.proof_of_address) {
          formData.append('proof_of_address', data.documents.proof_of_address);
        }

        return {
          url: '/compliance/kyc/submit',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Compliance'],
    }),

    // 2. List KYC Verifications
    listKYCVerifications: builder.query<
      ApiResponse<PaginatedResponse<KYCVerification>>,
      QueryParams | void
    >({
      query: (params) => ({
        url: '/compliance/kyc/verifications',
        params,
      }),
      providesTags: ['Compliance'],
    }),

    // 3. Get KYC Verification
    getKYCVerification: builder.query<ApiResponse<KYCVerification>, string>({
      query: (id) => `/compliance/kyc/verifications/verification/${id}`,
      providesTags: ['Compliance'],
    }),

    // 4. Get Current KYC Level
    getCurrentKYCLevel: builder.query<ApiResponse<CurrentKYCLevel>, void>({
      query: () => '/compliance/kyc/level',
      providesTags: ['Compliance'],
    }),
  }),
});

export const {
  useSubmitKYCMutation,
  useListKYCVerificationsQuery,
  useGetKYCVerificationQuery,
  useGetCurrentKYCLevelQuery,
} = complianceApi;
