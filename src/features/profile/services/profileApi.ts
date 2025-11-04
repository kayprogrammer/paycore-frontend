import { baseApi } from '@/store/api/baseApi';
import type { ApiResponse } from '@/types/common';
import type { Country } from '@/types/common';
import type { Profile, UpdateProfileRequest } from '../types';
import { User } from '@/features/auth/types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Profile
    getProfile: builder.query<ApiResponse<Profile & { user: User }>, void>({
      query: () => '/profiles/me',
      providesTags: ['Profile'],
    }),

    // 2. Update Profile
    updateProfile: builder.mutation<ApiResponse<Profile>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profiles/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // 3. Get Countries
    getCountries: builder.query<ApiResponse<Country[]>, void>({
      query: () => '/profiles/countries',
    }),

    // Upload Avatar
    uploadAvatar: builder.mutation<ApiResponse<{ avatar_url: string }>, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: '/profiles/avatar',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetCountriesQuery,
  useUploadAvatarMutation,
} = profileApi;
