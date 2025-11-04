import { useState } from 'react';
import {
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
  Progress,
  Stack,
  Text,
  useToast,
  VStack,
  IconButton,
  List,
  ListItem,
  ListIcon,
  Box,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { GoogleLogin } from '@react-oauth/google';
import { useRegisterMutation, useGoogleOAuthMutation } from '@/features/auth/services/authApi';
import { useAppDispatch } from '@/hooks';
import { setCredentials } from '@/store/slices/authSlice';

// Password strength checker
const checkPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  return strength;
};

const getPasswordStrengthColor = (strength: number): string => {
  if (strength < 40) return 'red';
  if (strength < 60) return 'orange';
  if (strength < 80) return 'yellow';
  return 'green';
};

const getPasswordStrengthLabel = (strength: number): string => {
  if (strength < 40) return 'Weak';
  if (strength < 60) return 'Fair';
  if (strength < 80) return 'Good';
  return 'Strong';
};

// Validation schema
const registerSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleOAuth, { isLoading: isGoogleLoading }] = useGoogleOAuthMutation();

  const password = watch('password', '');

  // Update password strength on password change
  useState(() => {
    setPasswordStrength(checkPasswordStrength(password));
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      }).unwrap();

      toast({
        title: 'Registration Successful',
        description: result.message || 'Please check your email to verify your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.data?.message || 'Could not create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
          title: 'Registration Successful',
          description: 'Welcome to PayCore!',
          status: 'success',
          duration: 3000,
        });

        navigate('/dashboard');
      } else {
        throw new Error('Invalid response structure');
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

  const passwordReqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

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
          Create Account
        </Heading>
        <Text fontSize="md" color="gray.600">
          Join PayCore and start managing your finances
        </Text>
      </VStack>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {/* Name Fields */}
          <HStack spacing={4}>
            <FormControl isInvalid={!!errors.first_name}>
              <FormLabel htmlFor="first_name">First Name</FormLabel>
              <Input
                id="first_name"
                placeholder="John"
                size="lg"
                {...register('first_name')}
              />
              <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.last_name}>
              <FormLabel htmlFor="last_name">Last Name</FormLabel>
              <Input
                id="last_name"
                placeholder="Doe"
                size="lg"
                {...register('last_name')}
              />
              <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
            </FormControl>
          </HStack>

          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email address</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
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
                placeholder="Create a strong password"
                {...register('password')}
                onChange={(e) => {
                  register('password').onChange(e);
                  setPasswordStrength(checkPasswordStrength(e.target.value));
                }}
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

            {/* Password Strength Indicator */}
            {password && (
              <Box mt={2}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.600">
                    Password Strength:
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={`${getPasswordStrengthColor(passwordStrength)}.500`}
                  >
                    {getPasswordStrengthLabel(passwordStrength)}
                  </Text>
                </HStack>
                <Progress
                  value={passwordStrength}
                  size="sm"
                  colorScheme={getPasswordStrengthColor(passwordStrength)}
                  borderRadius="full"
                />
              </Box>
            )}
          </FormControl>

          {/* Confirm Password Field */}
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <InputGroup size="lg">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword')}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
          </FormControl>

          {/* Password Requirements */}
          {password && (
            <Box bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.700">
                Password Requirements:
              </Text>
              <List spacing={1}>
                {passwordReqs.map((req, idx) => (
                  <ListItem key={idx} fontSize="xs" color="gray.600">
                    <ListIcon
                      as={req.met ? CheckCircleIcon : WarningIcon}
                      color={req.met ? 'green.500' : 'gray.400'}
                    />
                    {req.label}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Terms and Conditions */}
          <FormControl isInvalid={!!errors.agreeToTerms}>
            <Checkbox colorScheme="brand" {...register('agreeToTerms')}>
              <Text fontSize="sm">
                I agree to the{' '}
                <Link color="brand.500" fontWeight="medium">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link color="brand.500" fontWeight="medium">
                  Privacy Policy
                </Link>
              </Text>
            </Checkbox>
            <FormErrorMessage>{errors.agreeToTerms?.message}</FormErrorMessage>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            isLoading={isLoading}
            loadingText="Creating account..."
            w="full"
          >
            Create Account
          </Button>
        </Stack>
      </form>

      {/* Divider */}
      <HStack>
        <Divider />
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          Or sign up with
        </Text>
        <Divider />
      </HStack>

      {/* Google Sign-Up */}
      <Box w="full" minH="44px" display="flex" alignItems="center">
        <Box w="full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              toast({
                title: 'Google Sign-Up Failed',
                description: 'Could not initialize Google Sign-In',
                status: 'error',
                duration: 5000,
              });
            }}
            size="large"
            width="100%"
          />
        </Box>
      </Box>

      {/* Sign In Link */}
      <HStack justify="center" spacing={1}>
        <Text color="gray.600" fontSize="sm">
          Already have an account?
        </Text>
        <Link
          as={RouterLink}
          to="/login"
          color="brand.500"
          fontWeight="semibold"
          fontSize="sm"
          _hover={{ color: 'brand.600', textDecoration: 'underline' }}
        >
          Sign in
        </Link>
      </HStack>
    </VStack>
  );
};

export default RegisterPage;
