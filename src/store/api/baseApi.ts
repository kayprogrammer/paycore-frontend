import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiResponse } from '@/types/common';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Include cookies in requests for HTTP-only cookie support
  prepareHeaders: (headers) => {
    // Access token will be in HTTP-only cookie, but we check localStorage as fallback
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    // Refresh token is in HTTP-only cookie, so we just call the endpoint
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {}, // Empty body - backend will read refresh token from HTTP-only cookie
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as ApiResponse<{ access: string }>;
      // Store the new access token in localStorage (refresh token stays in HTTP-only cookie)
      if (data.data.access) {
        localStorage.setItem('access_token', data.data.access);
      }

      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Profile',
    'Wallets',
    'Cards',
    'Transactions',
    'Bills',
    'Payments',
    'Loans',
    'Investments',
    'Support',
    'Compliance',
    'Notifications',
    'AuditLogs',
  ],
  endpoints: () => ({}),
});
