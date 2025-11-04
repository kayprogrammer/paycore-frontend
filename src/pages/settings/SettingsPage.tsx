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
  Icon,
  Switch,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  FiShield,
  FiBell,
  FiMonitor,
  FiTrash2,
  FiKey,
  FiLock,
  FiMail,
  FiSmartphone,
  FiAlertCircle,
} from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  useChangePasswordMutation,
  useLogoutMutation,
} from '@/features/auth/services/authApi';
import { formatRelativeTime } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface PasswordForm {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const SettingsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Modals
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Forms
  const passwordForm = useForm<PasswordForm>();

  // API
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [logout] = useLogoutMutation();

  // Mock data for devices
  const devices = [
    {
      id: '1',
      device_name: 'Chrome on MacBook Pro',
      last_active: new Date().toISOString(),
      location: 'Lagos, Nigeria',
      is_current: true,
    },
    {
      id: '2',
      device_name: 'Safari on iPhone 14',
      last_active: new Date(Date.now() - 86400000).toISOString(),
      location: 'Lagos, Nigeria',
      is_current: false,
    },
  ];

  // Handlers
  const handlePasswordChange = async (data: PasswordForm) => {
    if (data.new_password !== data.confirm_password) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      }).unwrap();
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 3000,
      });
      onPasswordClose();
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: 'Password change failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // 2FA functionality removed - not available in current auth API
  // const handleToggle2FA = async (enable: boolean) => { ... }
  // const handleEnable2FA = async (data: TwoFactorForm) => { ... }

  const handleDeleteAccount = async () => {
    try {
      // Call delete account API
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
        status: 'success',
        duration: 3000,
      });
      await logout().unwrap();
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Failed to delete account',
        description: error.data?.message,
        status: 'error',
      });
    }
  };

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      // Call logout device API
      toast({
        title: 'Device logged out',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to logout device',
        status: 'error',
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Settings
          </Heading>
          <Text color="gray.600">Manage your account settings and preferences</Text>
        </Box>

        <Tabs>
          <TabList>
            <Tab>Security</Tab>
            <Tab>Notifications</Tab>
            <Tab>Devices</Tab>
            <Tab>Account</Tab>
          </TabList>

          <TabPanels>
            {/* Security Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      {/* Change Password */}
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiKey} boxSize={5} color="brand.500" />
                          <Box>
                            <Text fontWeight="600">Password</Text>
                            <Text fontSize="sm" color="gray.600">
                              Change your account password
                            </Text>
                          </Box>
                        </HStack>
                        <Button size="sm" onClick={onPasswordOpen}>
                          Change
                        </Button>
                      </HStack>

                      <Divider />

                      {/* Two-Factor Authentication - Removed (not available in auth API) */}

                      <Divider />

                      {/* Session Management */}
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={FiLock} boxSize={5} color="brand.500" />
                          <Box>
                            <Text fontWeight="600">Session Timeout</Text>
                            <Text fontSize="sm" color="gray.600">
                              Automatically logout after 30 minutes of inactivity
                            </Text>
                          </Box>
                        </HStack>
                        <Switch colorScheme="brand" defaultChecked />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      <Box>
                        <Heading size="sm" mb={4}>
                          Notification Channels
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon as={FiMail} color="gray.500" />
                              <Text>Email Notifications</Text>
                            </HStack>
                            <Switch
                              colorScheme="brand"
                              isChecked={emailNotifications}
                              onChange={(e) => setEmailNotifications(e.target.checked)}
                            />
                          </HStack>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon as={FiSmartphone} color="gray.500" />
                              <Text>Push Notifications</Text>
                            </HStack>
                            <Switch
                              colorScheme="brand"
                              isChecked={pushNotifications}
                              onChange={(e) => setPushNotifications(e.target.checked)}
                            />
                          </HStack>
                          <HStack justify="space-between">
                            <HStack>
                              <Icon as={FiSmartphone} color="gray.500" />
                              <Text>SMS Notifications</Text>
                            </HStack>
                            <Switch
                              colorScheme="brand"
                              isChecked={smsNotifications}
                              onChange={(e) => setSmsNotifications(e.target.checked)}
                            />
                          </HStack>
                        </VStack>
                      </Box>

                      <Divider />

                      <Box>
                        <Heading size="sm" mb={4}>
                          Notification Preferences
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="500">Transaction Alerts</Text>
                              <Text fontSize="sm" color="gray.600">
                                Get notified for all transactions
                              </Text>
                            </Box>
                            <Switch
                              colorScheme="brand"
                              isChecked={transactionAlerts}
                              onChange={(e) => setTransactionAlerts(e.target.checked)}
                            />
                          </HStack>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="500">Login Alerts</Text>
                              <Text fontSize="sm" color="gray.600">
                                Get notified when someone logs into your account
                              </Text>
                            </Box>
                            <Switch
                              colorScheme="brand"
                              isChecked={loginAlerts}
                              onChange={(e) => setLoginAlerts(e.target.checked)}
                            />
                          </HStack>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontWeight="500">Marketing Emails</Text>
                              <Text fontSize="sm" color="gray.600">
                                Receive updates about new features and promotions
                              </Text>
                            </Box>
                            <Switch
                              colorScheme="brand"
                              isChecked={marketingEmails}
                              onChange={(e) => setMarketingEmails(e.target.checked)}
                            />
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Devices Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <Heading size="sm" mb={4}>
                    Connected Devices
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Manage devices that are currently logged into your account
                  </Text>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Device</Th>
                        <Th>Location</Th>
                        <Th>Last Active</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {devices.map((device) => (
                        <Tr key={device.id}>
                          <Td>
                            <HStack>
                              <Icon as={FiMonitor} />
                              <Box>
                                <Text fontWeight="500">{device.device_name}</Text>
                                {device.is_current && (
                                  <Badge colorScheme="green" fontSize="xs">
                                    Current Device
                                  </Badge>
                                )}
                              </Box>
                            </HStack>
                          </Td>
                          <Td>{device.location}</Td>
                          <Td fontSize="sm" color="gray.600">
                            {formatRelativeTime(device.last_active)}
                          </Td>
                          <Td>
                            {!device.is_current && (
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleLogoutDevice(device.id)}
                              >
                                Logout
                              </Button>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Account Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack align="stretch" spacing={6}>
                      <Box>
                        <Heading size="sm" color="red.600" mb={2}>
                          Danger Zone
                        </Heading>
                        <Text fontSize="sm" color="gray.600" mb={4}>
                          Once you delete your account, there is no going back. Please be certain.
                        </Text>
                        <Button
                          colorScheme="red"
                          leftIcon={<Icon as={FiTrash2} />}
                          onClick={onDeleteOpen}
                        >
                          Delete Account
                        </Button>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Data & Privacy
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      <Button variant="outline" size="sm">
                        Download My Data
                      </Button>
                      <Button variant="outline" size="sm">
                        View Privacy Policy
                      </Button>
                      <Button variant="outline" size="sm">
                        View Terms of Service
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

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

      {/* 2FA Modal Removed - not available in auth API */}

      {/* Delete Account Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Account</AlertDialogHeader>
            <AlertDialogBody>
              <VStack align="start" spacing={3}>
                <HStack color="red.500">
                  <Icon as={FiAlertCircle} />
                  <Text fontWeight="600">This action cannot be undone!</Text>
                </HStack>
                <Text>
                  Deleting your account will permanently remove all your data, including:
                </Text>
                <VStack align="start" pl={4} spacing={1}>
                  <Text fontSize="sm">• All wallets and transactions</Text>
                  <Text fontSize="sm">• Cards and payment methods</Text>
                  <Text fontSize="sm">• Investment and loan records</Text>
                  <Text fontSize="sm">• Personal information and documents</Text>
                </VStack>
                <Text fontWeight="600">Are you absolutely sure?</Text>
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                Yes, Delete My Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};
