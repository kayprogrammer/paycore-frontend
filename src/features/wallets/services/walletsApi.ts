import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types/common';
import type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletBalance,
  SetPinRequest,
  ChangePinRequest,
  VerifyPinRequest,
  HoldFundsRequest,
  WalletHold,
  WalletSummary,
  WalletSecurityStatus,
} from '../types';

export const walletsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Wallet
    createWallet: builder.mutation<ApiResponse<Wallet>, CreateWalletRequest>({
      query: (data) => ({
        url: '/wallets/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 2. List Wallets
    listWallets: builder.query<ApiResponse<PaginatedResponse<Wallet>>, QueryParams | void>({
      query: (params) => ({
        url: '/wallets',
        params,
      }),
      providesTags: ['Wallets'],
    }),

    // 3. Get Wallet
    getWallet: builder.query<ApiResponse<Wallet>, string>({
      query: (id) => `/wallets/wallet/${id}`,
      providesTags: ['Wallets'],
    }),

    // 4. Update Wallet
    updateWallet: builder.mutation<ApiResponse<Wallet>, { id: string; data: UpdateWalletRequest }>({
      query: ({ id, data }) => ({
        url: `/wallets/wallet/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 5. Delete Wallet
    deleteWallet: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/wallets/wallet/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 6. Get Balance
    getWalletBalance: builder.query<ApiResponse<WalletBalance>, string>({
      query: (id) => `/wallets/wallet/${id}/balance`,
      providesTags: ['Wallets'],
    }),

    // 7. Set PIN
    setPin: builder.mutation<ApiResponse<{ message: string }>, { walletId: string; data: SetPinRequest }>({
      query: ({ walletId, data }) => ({
        url: `/wallets/wallet/${walletId}/pin/set`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 8. Change PIN
    changePin: builder.mutation<ApiResponse<{ message: string }>, { walletId: string; data: ChangePinRequest }>({
      query: ({ walletId, data }) => ({
        url: `/wallets/wallet/${walletId}/pin/change`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 9. Verify PIN
    verifyPin: builder.mutation<ApiResponse<{ valid: boolean }>, { walletId: string; data: VerifyPinRequest }>({
      query: ({ walletId, data }) => ({
        url: `/wallets/wallet/${walletId}/pin/verify`,
        method: 'POST',
        body: data,
      }),
    }),

    // 10. Enable Biometric
    enableBiometric: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (walletId) => ({
        url: `/wallets/wallet/${walletId}/biometric/enable`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 11. Disable Biometric
    disableBiometric: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (walletId) => ({
        url: `/wallets/wallet/${walletId}/biometric/disable`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 12. Hold Funds
    holdFunds: builder.mutation<ApiResponse<WalletHold>, { walletId: string; data: HoldFundsRequest }>({
      query: ({ walletId, data }) => ({
        url: `/wallets/wallet/${walletId}/hold`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 13. Release Hold
    releaseHold: builder.mutation<ApiResponse<{ message: string }>, { walletId: string; holdId: string }>({
      query: ({ walletId, holdId }) => ({
        url: `/wallets/wallet/${walletId}/hold/${holdId}/release`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 14. Get Summary
    getWalletSummary: builder.query<ApiResponse<WalletSummary>, void>({
      query: () => '/wallets/summary',
      providesTags: ['Wallets'],
    }),

    // 15. Change Status
    changeWalletStatus: builder.mutation<ApiResponse<Wallet>, { walletId: string; status: string }>({
      query: ({ walletId, status }) => ({
        url: `/wallets/wallet/${walletId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 16. Set Default
    setDefaultWallet: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (walletId) => ({
        url: `/wallets/wallet/${walletId}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['Wallets'],
    }),

    // 17. Get Security Status
    getSecurityStatus: builder.query<ApiResponse<WalletSecurityStatus>, string>({
      query: (walletId) => `/wallets/wallet/${walletId}/security`,
      providesTags: ['Wallets'],
    }),

    // 18. Verify Authorization
    verifyAuthorization: builder.mutation<
      ApiResponse<{ authorized: boolean }>,
      { walletId: string; pin?: string; biometric_token?: string }
    >({
      query: ({ walletId, ...data }) => ({
        url: `/wallets/wallet/${walletId}/verify`,
        method: 'POST',
        body: data,
      }),
    }),

    // 19. Get Holds
    getWalletHolds: builder.query<ApiResponse<WalletHold[]>, string>({
      query: (walletId) => `/wallets/wallet/${walletId}/holds`,
      providesTags: ['Wallets'],
    }),
  }),
});

export const {
  useCreateWalletMutation,
  useListWalletsQuery,
  useGetWalletQuery,
  useUpdateWalletMutation,
  useDeleteWalletMutation,
  useGetWalletBalanceQuery,
  useSetPinMutation,
  useChangePinMutation,
  useVerifyPinMutation,
  useEnableBiometricMutation,
  useDisableBiometricMutation,
  useHoldFundsMutation,
  useReleaseHoldMutation,
  useGetWalletSummaryQuery,
  useChangeWalletStatusMutation,
  useSetDefaultWalletMutation,
  useGetSecurityStatusQuery,
  useVerifyAuthorizationMutation,
  useGetWalletHoldsQuery,
} = walletsApi;
