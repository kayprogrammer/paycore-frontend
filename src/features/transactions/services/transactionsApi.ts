import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types/common';
import type {
  Transaction,
  TransferRequest,
  TransferResponse,
  InitiateDepositRequest,
  InitiateDepositResponse,
  VerifyDepositRequest,
  InitiateWithdrawalRequest,
  WithdrawalResponse,
  BankAccount,
  Bank,
  TransactionStatistics,
  Dispute,
  CreateDisputeRequest,
} from '../types';

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Transfer
    transfer: builder.mutation<ApiResponse<TransferResponse>, TransferRequest>({
      query: (data) => ({
        url: '/transactions/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions', 'Wallets'],
    }),

    // 2. Initiate Deposit
    initiateDeposit: builder.mutation<ApiResponse<InitiateDepositResponse>, InitiateDepositRequest>({
      query: (data) => ({
        url: '/transactions/deposit/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions'],
    }),

    // 3. Verify Deposit
    verifyDeposit: builder.mutation<ApiResponse<Transaction>, VerifyDepositRequest>({
      query: (data) => ({
        url: '/transactions/deposit/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions', 'Wallets'],
    }),

    // 4. Initiate Withdrawal
    initiateWithdrawal: builder.mutation<ApiResponse<WithdrawalResponse>, InitiateWithdrawalRequest>({
      query: (data) => ({
        url: '/transactions/withdrawal/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions', 'Wallets'],
    }),

    // 5. Verify Bank Account
    verifyBankAccount: builder.mutation<
      ApiResponse<BankAccount>,
      { account_number: string; bank_code: string }
    >({
      query: (data) => ({
        url: '/transactions/bank/verify',
        method: 'POST',
        body: data,
      }),
    }),

    // 6. Get Banks
    getBanks: builder.query<ApiResponse<Bank[]>, string | void>({
      query: (country = 'NG') => ({
        url: '/transactions/banks',
        params: { country },
      }),
    }),

    // 7. List Transactions
    listTransactions: builder.query<ApiResponse<PaginatedResponse<Transaction>>, QueryParams | void>({
      query: (params) => ({
        url: '/transactions',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // 8. Get Transaction
    getTransaction: builder.query<ApiResponse<Transaction>, string>({
      query: (id) => `/transactions/transaction/${id}`,
      providesTags: ['Transactions'],
    }),

    // 9. Get Wallet Transactions
    getWalletTransactions: builder.query<
      ApiResponse<PaginatedResponse<Transaction>>,
      { walletId: string; params?: QueryParams }
    >({
      query: ({ walletId, params }) => ({
        url: `/transactions/wallet/${walletId}`,
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // 10. Get Transaction Statistics
    getTransactionStatistics: builder.query<
      ApiResponse<TransactionStatistics>,
      { walletId?: string; start_date?: string; end_date?: string }
    >({
      query: (params) => ({
        url: '/transactions/statistics',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // 11. Create Dispute
    createDispute: builder.mutation<ApiResponse<Dispute>, CreateDisputeRequest>({
      query: (data) => ({
        url: '/transactions/disputes/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transactions'],
    }),

    // 12. List Disputes
    listDisputes: builder.query<ApiResponse<PaginatedResponse<Dispute>>, QueryParams | void>({
      query: (params) => ({
        url: '/transactions/disputes',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // 13. Get Dispute
    getDispute: builder.query<ApiResponse<Dispute>, string>({
      query: (id) => `/transactions/disputes/dispute/${id}`,
      providesTags: ['Transactions'],
    }),

    // 14. Get Dispute Details
    getDisputeDetails: builder.query<
      ApiResponse<Dispute & { transaction: Transaction }>,
      string
    >({
      query: (id) => `/transactions/disputes/dispute/${id}/details`,
      providesTags: ['Transactions'],
    }),
  }),
});

export const {
  useTransferMutation,
  useInitiateDepositMutation,
  useVerifyDepositMutation,
  useInitiateWithdrawalMutation,
  useVerifyBankAccountMutation,
  useGetBanksQuery,
  useListTransactionsQuery,
  useGetTransactionQuery,
  useGetWalletTransactionsQuery,
  useGetTransactionStatisticsQuery,
  useCreateDisputeMutation,
  useListDisputesQuery,
  useGetDisputeQuery,
  useGetDisputeDetailsQuery,
} = transactionsApi;
