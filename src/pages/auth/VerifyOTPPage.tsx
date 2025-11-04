import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Link,
  PinInput,
  PinInputField,
  Stack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useVerifyOTPMutation, useLoginMutation } from '@/features/auth/services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const dispatch = useDispatch();

  const email = location.state?.email;

  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useLoginMutation();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'No email provided. Please login again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/auth/login');
    }
  }, [email, navigate, toast]);

  const handleOtpChange = (value: string) => {
    setOtp(value);

    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;

    if (otpToVerify.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      const response = await verifyOTP({
        email: email,
        otp: parseInt(otpToVerify),
        device_type: 'web',
      }).unwrap();

      // Store tokens and user data in Redux and localStorage
      dispatch(
        setCredentials({
          user: response.data.user,
          accessToken: response.data.access,
          refreshToken: response.data.refresh,
        })
      );

      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.data.user.first_name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error?.data?.message || error?.data?.detail || 'Invalid OTP. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      setOtp('');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !email) return;

    try {
      const response = await resendOTP({
        email: email,
        password: '', // Password not needed for resend, but required by type
      }).unwrap();

      toast({
        title: 'OTP resent',
        description: response.message || 'A new OTP has been sent to your email',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (error: any) {
      toast({
        title: 'Failed to resend OTP',
        description: error?.data?.message || 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={4}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Logo and Header */}
          <VStack spacing={2} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, brand.500, brand.600)"
              bgClip="text"
              fontWeight="extrabold"
            >
              PayCore
            </Heading>
            <Heading as="h2" size="lg" color="gray.800" mt={4}>
              Verify Your Identity
            </Heading>
            <Text fontSize="md" color="gray.600" textAlign="center" maxW="400px">
              We've sent a 6-digit verification code to{' '}
              <Text as="span" fontWeight="semibold" color="brand.600">
                {email}
              </Text>
            </Text>
          </VStack>

          {/* OTP Form */}
          <Box
            bg="white"
            py={8}
            px={10}
            shadow="lg"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Stack spacing={6}>
              {/* OTP Input */}
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                  Enter verification code
                </Text>
                <HStack justify="center" spacing={3}>
                  <PinInput
                    otp
                    size="lg"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder=""
                    focusBorderColor="brand.500"
                    errorBorderColor="red.500"
                  >
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                    <PinInputField
                      w="50px"
                      h="60px"
                      fontSize="2xl"
                      fontWeight="bold"
                      borderRadius="lg"
                      borderWidth="2px"
                    />
                  </PinInput>
                </HStack>
              </VStack>

              {/* Verify Button */}
              <Button
                colorScheme="brand"
                size="lg"
                fontSize="md"
                fontWeight="bold"
                isLoading={isLoading}
                loadingText="Verifying..."
                onClick={() => handleVerifyOTP()}
                w="full"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
                isDisabled={otp.length !== 6}
              >
                Verify OTP
              </Button>

              {/* Resend OTP */}
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  Didn't receive the code?
                </Text>
                {canResend ? (
                  <Button
                    variant="link"
                    colorScheme="brand"
                    size="sm"
                    fontWeight="semibold"
                    onClick={handleResendOTP}
                    isLoading={isResending}
                    loadingText="Sending..."
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    Resend OTP in{' '}
                    <Text as="span" fontWeight="semibold" color="brand.500">
                      {countdown}s
                    </Text>
                  </Text>
                )}
              </VStack>

              {/* Back to Login Link */}
              <HStack justify="center" spacing={1} pt={2}>
                <Text color="gray.600" fontSize="sm">
                  Wrong email?
                </Text>
                <Link
                  as={RouterLink}
                  to="/auth/login"
                  color="brand.500"
                  fontWeight="semibold"
                  fontSize="sm"
                  _hover={{ color: 'brand.600', textDecoration: 'underline' }}
                >
                  Go back to login
                </Link>
              </HStack>
            </Stack>
          </Box>

          {/* Security Notice */}
          <Box
            bg="blue.50"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="blue.200"
          >
            <HStack spacing={3} align="start">
              <Box color="blue.500" mt={0.5}>
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                  Security Notice
                </Text>
                <Text fontSize="xs" color="blue.700">
                  Never share your verification code with anyone. PayCore will never ask for your OTP via phone or email.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyOTPPage;
