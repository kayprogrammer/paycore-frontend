import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Badge,
  Icon,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Divider,
  Progress,
} from '@chakra-ui/react';
import {
  FiUser,
  FiEdit,
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetCountriesQuery,
} from '@/features/profile/services/profileApi';
import {
  useSubmitKYCMutation,
  useGetCurrentKYCLevelQuery,
} from '@/features/compliance/services/complianceApi';
import { useChangePasswordMutation } from '@/features/auth/services/authApi';
import { formatDate } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface KYCForm {
  level: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id_type: string;
  id_number: string;
  id_document: File | null;
  selfie: File | null;
  proof_of_address: File | null;
}

interface PasswordForm {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const ProfilePage = () => {
  const toast = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isKYCOpen, onOpen: onKYCOpen, onClose: onKYCClose } = useDisclosure();

  const profileForm = useForm<ProfileForm>();
  const passwordForm = useForm<PasswordForm>();
  const kycForm = useForm<any>();

  const { data: profileData, isLoading, error } = useGetProfileQuery();
  const { data: countriesData } = useGetCountriesQuery();
  const { data: kycData } = useGetCurrentKYCLevelQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [submitKYC, { isLoading: submittingKYC }] = useSubmitKYCMutation();

  const profile = profileData?.data;
  const user = profile?.user;
  const countries = countriesData?.data || [];
  const kyc = kycData?.data;

  const handleEditProfile = async (data: ProfileForm) => {
    try {
      await updateProfile(data).unwrap();
      toast({ title: 'Profile updated successfully', status: 'success', duration: 3000 });
      onEditClose();
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.data?.message, status: 'error' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(file).unwrap();
      toast({ title: 'Avatar updated successfully', status: 'success' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.data?.message, status: 'error' });
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    if (data.new_password !== data.confirm_password) {
      toast({ title: 'Passwords do not match', status: 'error' });
      return;
    }

    try {
      await changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      }).unwrap();
      toast({ title: 'Password changed successfully', status: 'success' });
      onPasswordClose();
      passwordForm.reset();
    } catch (error: any) {
      toast({ title: 'Password change failed', description: error.data?.message, status: 'error' });
    }
  };

  const handleKYCSubmit = async (data: any) => {
    const formData = {
      ...data,
      documents: {
        id_document: data.id_document[0],
        selfie: data.selfie[0],
        proof_of_address: data.proof_of_address?.[0],
      },
    };

    try {
      await submitKYC(formData).unwrap();
      toast({
        title: 'KYC submitted successfully',
        description: 'Your verification is being processed',
        status: 'success',
        duration: 5000,
      });
      onKYCClose();
      kycForm.reset();
    } catch (error: any) {
      toast({ title: 'KYC submission failed', description: error.data?.message, status: 'error' });
    }
  };

  const openEditModal = () => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        date_of_birth: profile.date_of_birth,
        address_line_1: profile.address_line_1,
        address_line_2: profile.address_line_2,
        city: profile.city,
        state: profile.state,
        postal_code: profile.postal_code,
        country: profile.country,
      });
    }
    onEditOpen();
  };

  const getKYCProgress = () => {
    const levels = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'];
    const currentIndex = levels.indexOf(kyc?.current_level || 'TIER_0');
    return ((currentIndex + 1) / levels.length) * 100;
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="200px" borderRadius="xl" />
          <Skeleton height="400px" borderRadius="xl" />
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <ErrorAlert message="Failed to load profile. Please try again." />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Profile Header */}
        <Card>
          <CardBody>
            <HStack spacing={6} align="start">
              <Box position="relative">
                <Avatar size="2xl" name={`${profile?.first_name} ${profile?.last_name}`} src={profile?.avatar_url} />
                <Button
                  size="sm"
                  position="absolute"
                  bottom={0}
                  right={0}
                  borderRadius="full"
                  colorScheme="brand"
                  as="label"
                  cursor="pointer"
                  isLoading={uploading}
                >
                  <Icon as={FiCamera} />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                </Button>
              </Box>
              <VStack align="start" flex={1} spacing={3}>
                <HStack>
                  <Heading size="lg">
                    {profile?.first_name} {profile?.last_name}
                  </Heading>
                  {user?.is_verified && <Icon as={FiCheckCircle} color="green.500" boxSize={5} />}
                </HStack>
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Icon as={FiMail} color="gray.500" />
                    <Text color="gray.600">{user?.email}</Text>
                  </HStack>
                  {profile?.phone_number && (
                    <HStack>
                      <Icon as={FiPhone} color="gray.500" />
                      <Text color="gray.600">{profile.phone_number}</Text>
                    </HStack>
                  )}
                  {profile?.city && (
                    <HStack>
                      <Icon as={FiMapPin} color="gray.500" />
                      <Text color="gray.600">
                        {profile.city}, {profile.state}, {profile.country}
                      </Text>
                    </HStack>
                  )}
                </VStack>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<Icon as={FiEdit} />} onClick={openEditModal}>
                    Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" onClick={onPasswordOpen}>
                    Change Password
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* KYC Status */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiShield} boxSize={6} color="brand.500" />
                  <Heading size="md">KYC Verification</Heading>
                </HStack>
                <Badge colorScheme={kyc?.current_level === 'TIER_3' ? 'green' : 'yellow'} fontSize="md" px={3} py={1}>
                  {kyc?.current_level || 'TIER_0'}
                </Badge>
              </HStack>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">
                    Verification Progress
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {Math.round(getKYCProgress())}%
                  </Text>
                </HStack>
                <Progress value={getKYCProgress()} colorScheme="brand" borderRadius="full" />
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Transaction Limit
                  </Text>
                  <Text fontWeight="600">{kyc?.limits?.daily_transaction_limit || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Daily Limit
                  </Text>
                  <Text fontWeight="600">{kyc?.limits?.daily_limit || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Balance Limit
                  </Text>
                  <Text fontWeight="600">{kyc?.limits?.balance_limit || 'N/A'}</Text>
                </Box>
              </SimpleGrid>

              {kyc?.current_level !== 'TIER_3' && (
                <Button colorScheme="brand" onClick={onKYCOpen}>
                  Upgrade Verification Level
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Personal Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  First Name
                </Text>
                <Text fontWeight="600">{profile?.first_name || 'Not set'}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Last Name
                </Text>
                <Text fontWeight="600">{profile?.last_name || 'Not set'}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Date of Birth
                </Text>
                <Text fontWeight="600">
                  {profile?.date_of_birth ? formatDate(profile.date_of_birth) : 'Not set'}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Phone Number
                </Text>
                <Text fontWeight="600">{profile?.phone_number || 'Not set'}</Text>
              </Box>
              <Box gridColumn={{ md: 'span 2' }}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Address
                </Text>
                <Text fontWeight="600">
                  {profile?.address_line_1
                    ? `${profile.address_line_1}, ${profile.city}, ${profile.state} ${profile.postal_code}, ${profile.country}`
                    : 'Not set'}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={profileForm.handleSubmit(handleEditProfile)}>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input {...profileForm.register('first_name')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input {...profileForm.register('last_name')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input {...profileForm.register('phone_number')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input type="date" {...profileForm.register('date_of_birth')} />
                </FormControl>
                <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                  <FormLabel>Address Line 1</FormLabel>
                  <Input {...profileForm.register('address_line_1')} />
                </FormControl>
                <FormControl gridColumn={{ md: 'span 2' }}>
                  <FormLabel>Address Line 2</FormLabel>
                  <Input {...profileForm.register('address_line_2')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Input {...profileForm.register('city')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>State</FormLabel>
                  <Input {...profileForm.register('state')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Postal Code</FormLabel>
                  <Input {...profileForm.register('postal_code')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Country</FormLabel>
                  <Select {...profileForm.register('country')}>
                    {countries.map((country: any) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={updating}>
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
            <ModalHeader>Change Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Current Password</FormLabel>
                  <Input type="password" {...passwordForm.register('old_password')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input type="password" {...passwordForm.register('new_password')} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input type="password" {...passwordForm.register('confirm_password')} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPasswordClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={changingPassword}>
                Change Password
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* KYC Submission Modal */}
      <Modal isOpen={isKYCOpen} onClose={onKYCClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={kycForm.handleSubmit(handleKYCSubmit)}>
            <ModalHeader>Submit KYC Verification</ModalHeader>
            <ModalCloseButton />
            <ModalBody maxH="70vh" overflowY="auto">
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Verification Level</FormLabel>
                  <Select {...kycForm.register('level')}>
                    <option value="TIER_1">Tier 1 - Basic</option>
                    <option value="TIER_2">Tier 2 - Intermediate</option>
                    <option value="TIER_3">Tier 3 - Advanced</option>
                  </Select>
                </FormControl>

                <Divider />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input {...kycForm.register('first_name')} defaultValue={profile?.first_name} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input {...kycForm.register('last_name')} defaultValue={profile?.last_name} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input type="date" {...kycForm.register('date_of_birth')} defaultValue={profile?.date_of_birth} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>ID Type</FormLabel>
                    <Select {...kycForm.register('id_type')}>
                      <option value="national_id">National ID</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                    <FormLabel>ID Number</FormLabel>
                    <Input {...kycForm.register('id_number')} />
                  </FormControl>
                  <FormControl isRequired gridColumn={{ md: 'span 2' }}>
                    <FormLabel>Address</FormLabel>
                    <Input {...kycForm.register('address_line_1')} defaultValue={profile?.address_line_1} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input {...kycForm.register('city')} defaultValue={profile?.city} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>State</FormLabel>
                    <Input {...kycForm.register('state')} defaultValue={profile?.state} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Postal Code</FormLabel>
                    <Input {...kycForm.register('postal_code')} defaultValue={profile?.postal_code} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Country</FormLabel>
                    <Input {...kycForm.register('country')} defaultValue={profile?.country} />
                  </FormControl>
                </SimpleGrid>

                <Divider />

                <FormControl isRequired>
                  <FormLabel>ID Document</FormLabel>
                  <Input type="file" {...kycForm.register('id_document')} accept="image/*,application/pdf" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Selfie</FormLabel>
                  <Input type="file" {...kycForm.register('selfie')} accept="image/*" />
                </FormControl>
                <FormControl>
                  <FormLabel>Proof of Address (Optional for Tier 1)</FormLabel>
                  <Input type="file" {...kycForm.register('proof_of_address')} accept="image/*,application/pdf" />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onKYCClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={submittingKYC}>
                Submit for Verification
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};
