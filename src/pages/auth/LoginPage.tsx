import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useToast,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { GoogleLogin } from '@react-oauth/google';
import { MdFingerprint } from 'react-icons/md';
import { useLoginMutation, useBiometricLoginMutation, useGoogleOAuthMutation } from '@/features/auth/services/authApi';
import { useAppDispatch } from '@/hooks';
import { setCredentials } from '@/store/slices/authSlice';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometric] = useState(false); // Check if user has biometric enabled

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const [login, { isLoading }] = useLoginMutation();
  const [biometricLogin, { isLoading: isBiometricLoading }] = useBiometricLoginMutation();
  const [googleOAuth, { isLoading: isGoogleLoading }] = useGoogleOAuthMutation();

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      toast({
        title: 'OTP Sent',
        description: result.message || 'Please check your email for the OTP code',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to OTP verification with email in state
      navigate('/verify-otp', {
        state: {
          email: data.email,
          fromLogin: true,
        },
      });
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error?.data?.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await biometricLogin({
        device_id: 'device-123', // Get from device storage
      }).unwrap();

      if (result.data) {
        dispatch(
          setCredentials({
            user: result.data.user,
            accessToken: result.data.access,
            refreshToken: result.data.refresh || null,
          })
        );

        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Biometric Login Failed',
        description: error?.data?.message || 'Could not authenticate with biometric',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const result = await googleOAuth({
        id_token: credentialResponse.credential,
      }).unwrap();

      console.log('Google OAuth Response:', result);

      // Handle different response structures
      const userData = result.data?.user || result.user;
      const accessToken = result.data?.access || result.access;
      const refreshToken = result.data?.refresh || result.refresh;

      if (userData && accessToken) {
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        dispatch(
          setCredentials({
            user: userData,
            accessToken: accessToken,
            refreshToken: refreshToken || null,
          })
        );

        toast({
          title: 'Login Successful',
          description: 'Welcome to PayCore!',
          status: 'success',
          duration: 3000,
        });

        navigate('/dashboard');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('Google Login Error:', error);
      toast({
        title: 'Google Login Failed',
        description: error?.data?.message || error?.message || 'Could not sign in with Google',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Heading
          as="h1"
          size="xl"
          bgGradient="linear(to-r, brand.500, brand.600)"
          bgClip="text"
        >
          Welcome Back
        </Heading>
        <Text fontSize="md" color="gray.600">
          Sign in to your PayCore account
        </Text>
      </VStack>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email address</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              size="lg"
              {...register('email')}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup size="lg">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          {/* Remember Me & Forgot Password */}
          <HStack justify="space-between">
            <Checkbox colorScheme="brand" {...register('rememberMe')}>
              Remember me
            </Checkbox>
            <Link
              as={RouterLink}
              to="/forgot-password"
              color="brand.500"
              fontWeight="medium"
              fontSize="sm"
              _hover={{ color: 'brand.600' }}
            >
              Forgot password?
            </Link>
          </HStack>

          {/* Submit Button */}
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            isLoading={isLoading}
            loadingText="Signing in..."
            w="full"
          >
            Sign in
          </Button>

          {/* Biometric Login Button */}
          {hasBiometric && (
            <Button
              leftIcon={<MdFingerprint size={20} />}
              variant="outline"
              colorScheme="brand"
              size="lg"
              onClick={handleBiometricLogin}
              isLoading={isBiometricLoading}
              loadingText="Authenticating..."
              w="full"
            >
              Sign in with Biometric
            </Button>
          )}
        </Stack>
      </form>

      {/* Divider */}
      <HStack>
        <Divider />
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Or continue with
        </Text>
        <Divider />
      </HStack>

      {/* Google Sign-In */}
      <Box w="full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast({
              title: 'Google Sign-In Failed',
              description: 'Could not initialize Google Sign-In',
              status: 'error',
              duration: 5000,
            });
          }}
          useOneTap
          size="large"
          width="100%"
        />
      </Box>

      {/* Sign Up Link */}
      <HStack justify="center" spacing={1}>
        <Text color="gray.600" fontSize="sm">
          Don't have an account?
        </Text>
        <Link
          as={RouterLink}
          to="/register"
          color="brand.500"
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ color: 'brand.600', textDecoration: 'underline' }}
        >
          Sign up
        </Link>
      </HStack>
    </VStack>
  );
};

export default LoginPage;
