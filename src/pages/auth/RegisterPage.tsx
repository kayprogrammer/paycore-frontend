import { useNavigate } from 'react-router-dom';
import {
  Heading,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useGoogleOAuthMutation } from '@/features/auth/services/authApi';
import { useLazyGetProfileQuery } from '@/features/profile/services/profileApi';
import { useAppDispatch } from '@/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [googleOAuth, { isLoading: isGoogleLoading }] = useGoogleOAuthMutation();
  const [getProfile] = useLazyGetProfileQuery();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await googleOAuth({
        id_token: credentialResponse.credential,
      }).unwrap();

      console.log('Google OAuth Response:', result);

      // Extract tokens from response
      const accessToken = result.data?.access || result.access;
      const refreshToken = result.data?.refresh || result.refresh;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Store access token first so it's available for profile fetch
      localStorage.setItem('access_token', accessToken);
      if (refreshToken && refreshToken !== 'Set as HTTP-only cookie') {
        localStorage.setItem('refresh_token', refreshToken);
      }

      // Fetch user profile data using RTK Query
      const profileResult = await getProfile().unwrap();
      console.log('Profile data received:', profileResult);

      const profileData = profileResult.data;

      if (profileData) {
        // Decode JWT to get user_id
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));

        // Construct user object from profile data and token
        const userData = {
          id: tokenPayload.user_id,
          email: '', // Will be populated from another source if needed
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone_number: profileData.phone_number,
          avatar: profileData.avatar_url || null,
          is_active: true,
          is_staff: false,
          kyc_level: profileData.kyc_level || 'tier_0',
          created_at: new Date().toISOString(),
        };

        dispatch(
          setCredentials({
            user: userData,
            accessToken: accessToken,
            refreshToken: refreshToken !== 'Set as HTTP-only cookie' ? refreshToken : null,
          })
        );

        toast({
          title: 'Registration Successful',
          description: `Welcome, ${userData.first_name}!`,
          status: 'success',
          duration: 3000,
        });

        navigate('/dashboard');
      } else {
        throw new Error('No profile data in response');
      }
    } catch (error: any) {
      console.error('Google Sign-Up Error:', error);
      toast({
        title: 'Google Sign-Up Failed',
        description: error?.data?.message || error?.message || 'Could not sign up with Google',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Heading
          as="h1"
          size="xl"
          bgGradient="linear(to-r, brand.500, brand.600)"
          bgClip="text"
        >
          Create Your Account
        </Heading>
        <Text fontSize="md" color="gray.600">
          Sign up with your Google account to get started
        </Text>
      </VStack>

      {/* Google Sign-In */}
      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast({
            title: 'Google Sign-Up Failed',
            description: 'Could not initialize Google Sign-Up',
            status: 'error',
            duration: 5000,
          });
        }}
        text="Sign up with Google"
        isLoading={isGoogleLoading}
      />
    </VStack>
  );
};

export default RegisterPage;
