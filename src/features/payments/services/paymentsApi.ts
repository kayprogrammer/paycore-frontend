import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types/common';
import type {
  PaymentLink,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  Payment,
  PayPaymentLinkRequest,
  PayInvoiceRequest,
} from '../types';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Create Payment Link
    createPaymentLink: builder.mutation<ApiResponse<PaymentLink>, CreatePaymentLinkRequest>({
      query: (data) => ({
        url: '/payments/links/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // 2. List Payment Links
    listPaymentLinks: builder.query<
      ApiResponse<PaginatedResponse<PaymentLink>>,
      QueryParams | void
    >({
      query: (params) => ({
        url: '/payments/links',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // 3. Get Payment Link
    getPaymentLink: builder.query<ApiResponse<PaymentLink>, string>({
      query: (id) => `/payments/links/link/${id}`,
      providesTags: ['Payments'],
    }),

    // 4. Update Payment Link
    updatePaymentLink: builder.mutation<
      ApiResponse<PaymentLink>,
      { id: string; data: UpdatePaymentLinkRequest }
    >({
      query: ({ id, data }) => ({
        url: `/payments/links/link/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // 5. Delete Payment Link
    deletePaymentLink: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/payments/links/link/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),

    // 6. Pay Payment Link
    payPaymentLink: builder.mutation<ApiResponse<Payment>, PayPaymentLinkRequest>({
      query: (data) => ({
        url: '/payments/links/pay',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Wallets'],
    }),

    // 7. Create Invoice
    createInvoice: builder.mutation<ApiResponse<Invoice>, CreateInvoiceRequest>({
      query: (data) => ({
        url: '/payments/invoices/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // 8. List Invoices
    listInvoices: builder.query<ApiResponse<PaginatedResponse<Invoice>>, QueryParams | void>({
      query: (params) => ({
        url: '/payments/invoices',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // 9. Get Invoice
    getInvoice: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => `/payments/invoices/invoice/${id}`,
      providesTags: ['Payments'],
    }),

    // 10. Update Invoice
    updateInvoice: builder.mutation<
      ApiResponse<Invoice>,
      { id: string; data: UpdateInvoiceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/payments/invoices/invoice/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // 11. Delete Invoice
    deleteInvoice: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/payments/invoices/invoice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),

    // 12. Pay Invoice
    payInvoice: builder.mutation<ApiResponse<Payment>, PayInvoiceRequest>({
      query: (data) => ({
        url: '/payments/invoices/pay',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Wallets'],
    }),

    // 13. List Payments
    listPayments: builder.query<ApiResponse<PaginatedResponse<Payment>>, QueryParams | void>({
      query: (params) => ({
        url: '/payments',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // 14. Get Payment
    getPayment: builder.query<ApiResponse<Payment>, string>({
      query: (id) => `/payments/payment/${id}`,
      providesTags: ['Payments'],
    }),

    // 15. Send Invoice
    sendInvoice: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (invoiceId) => ({
        url: `/payments/invoices/invoice/${invoiceId}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['Payments'],
    }),

    // 16. Download Invoice
    downloadInvoice: builder.query<Blob, string>({
      query: (invoiceId) => ({
        url: `/payments/invoices/invoice/${invoiceId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useCreatePaymentLinkMutation,
  useListPaymentLinksQuery,
  useGetPaymentLinkQuery,
  useUpdatePaymentLinkMutation,
  useDeletePaymentLinkMutation,
  usePayPaymentLinkMutation,
  useCreateInvoiceMutation,
  useListInvoicesQuery,
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  usePayInvoiceMutation,
  useListPaymentsQuery,
  useGetPaymentQuery,
  useSendInvoiceMutation,
  useLazyDownloadInvoiceQuery,
} = paymentsApi;
