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
  FiLock,
  FiMail,
  FiSmartphone,
} from 'react-icons/fi';
import { useState } from 'react';
import { useLogoutMutation } from '@/features/auth/services/authApi';
import { formatRelativeTime } from '@/utils/formatters';

export const SettingsPage = () => {
  const toast = useToast();

  // State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // API
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
    </Container>
  );
};
