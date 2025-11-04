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
  SimpleGrid,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Spinner,
} from '@chakra-ui/react';
import {
  FiZap,
  FiTv,
  FiWifi,
  FiPhone,
  FiDroplet,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useListProvidersQuery,
  useListPackagesQuery,
  useValidateCustomerMutation,
  usePayBillMutation,
  useListBillPaymentsQuery,
} from '@/features/bills/services/billsApi';
import { useListWalletsQuery } from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';

interface PaymentForm {
  wallet_id: string;
  provider_id: string;
  package_id?: string;
  customer_identifier: string;
  amount?: number;
  pin: string;
}

const BILL_CATEGORIES = [
  { id: 'airtime', name: 'Airtime', icon: FiPhone, color: 'blue' },
  { id: 'data', name: 'Mobile Data', icon: FiWifi, color: 'purple' },
  { id: 'electricity', name: 'Electricity', icon: FiZap, color: 'yellow' },
  { id: 'cable_tv', name: 'Cable TV', icon: FiTv, color: 'red' },
  { id: 'water', name: 'Water', icon: FiDroplet, color: 'cyan' },
  { id: 'internet', name: 'Internet', icon: FiWifi, color: 'green' },
];

export const BillsPage = () => {
  const toast = useToast();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [validatedCustomer, setValidatedCustomer] = useState<any>(null);

  // Modals
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();

  // Forms
  const paymentForm = useForm<PaymentForm>();

  // API
  const { data: providersData, isLoading: loadingProviders } = useListProvidersQuery(
    { category: selectedCategory || undefined },
    { skip: !selectedCategory }
  );
  const { data: packagesData, isLoading: loadingPackages } = useListPackagesQuery(
    selectedProvider?.id || '',
    { skip: !selectedProvider }
  );
  const { data: walletsData } = useListWalletsQuery();
  const { data: paymentsData, isLoading: loadingHistory } = useListBillPaymentsQuery({ limit: 20 });
  const [validateCustomer, { isLoading: validating }] = useValidateCustomerMutation();
  const [payBill, { isLoading: paying }] = usePayBillMutation();

  const providers = providersData?.data || [];
  const packages = packagesData?.data || [];
  const wallets = walletsData?.data?.data || [];
  const payments = paymentsData?.data?.data || [];

  // Handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedProvider(null);
    setSelectedPackage(null);
    setValidatedCustomer(null);
  };

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setSelectedPackage(null);
    setValidatedCustomer(null);
    paymentForm.setValue('provider_id', provider.id);
    onPaymentOpen();
  };

  const handleValidateCustomer = async () => {
    const customerId = paymentForm.getValues('customer_identifier');
    const providerId = paymentForm.getValues('provider_id');

    if (!customerId || !providerId) {
      toast({
        title: 'Please enter customer ID',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await validateCustomer({
        provider_id: providerId,
        customer_identifier: customerId,
      }).unwrap();
      setValidatedCustomer(result.data);
      toast({
        title: 'Customer validated',
        description: `Name: ${result.data?.customer_name}`,
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Validation failed',
        description: error.data?.message || 'Could not validate customer',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePayment = async (data: PaymentForm) => {
    if (!validatedCustomer) {
      toast({
        title: 'Please validate customer first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await payBill({
        ...data,
        amount: data.amount || selectedPackage?.price,
      }).unwrap();
      toast({
        title: 'Payment successful',
        description: 'Your bill has been paid',
        status: 'success',
        duration: 3000,
      });
      onPaymentClose();
      paymentForm.reset();
      setSelectedProvider(null);
      setSelectedPackage(null);
      setValidatedCustomer(null);
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>
              Pay Bills
            </Heading>
            <Text color="gray.600">Pay for airtime, data, electricity, and more</Text>
          </Box>
          <Button variant="outline" onClick={onHistoryOpen}>
            Payment History
          </Button>
        </HStack>

        {/* Categories Grid */}
        <Box>
          <Heading size="md" mb={4}>
            Select Category
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {BILL_CATEGORIES.map((category) => (
              <Card
                key={category.id}
                cursor="pointer"
                borderWidth={2}
                borderColor={selectedCategory === category.id ? `${category.color}.500` : 'transparent'}
                transition="all 0.2s"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardBody>
                  <VStack spacing={3}>
                    <Icon
                      as={category.icon}
                      boxSize={10}
                      color={`${category.color}.500`}
                    />
                    <Text fontWeight="600" fontSize="sm" textAlign="center">
                      {category.name}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Providers */}
        {selectedCategory && (
          <Box>
            <Heading size="md" mb={4}>
              Select Provider
            </Heading>
            {loadingProviders ? (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height="120px" borderRadius="lg" />
                ))}
              </SimpleGrid>
            ) : providers.length > 0 ? (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {providers.map((provider: any) => (
                  <Card
                    key={provider.id}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                    onClick={() => handleProviderSelect(provider)}
                  >
                    <CardBody>
                      <VStack spacing={3}>
                        {provider.logo_url ? (
                          <Image
                            src={provider.logo_url}
                            alt={provider.name}
                            boxSize="60px"
                            objectFit="contain"
                          />
                        ) : (
                          <Icon as={FiFileText} boxSize={10} color="gray.400" />
                        )}
                        <VStack spacing={1}>
                          <Text fontWeight="600" fontSize="sm" textAlign="center">
                            {provider.name}
                          </Text>
                          {provider.available && (
                            <Badge colorScheme="green" fontSize="xs">
                              Available
                            </Badge>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <EmptyState
                icon={FiFileText}
                title="No providers available"
                description="Check back later for available providers"
              />
            )}
          </Box>
        )}
      </VStack>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={paymentForm.handleSubmit(handlePayment)}>
            <ModalHeader>
              Pay {selectedProvider?.name} Bill
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {/* Select Package (if applicable) */}
                {selectedProvider?.has_packages && packages.length > 0 && (
                  <FormControl isRequired>
                    <FormLabel>Select Package</FormLabel>
                    <Select
                      {...paymentForm.register('package_id')}
                      placeholder="Choose package"
                      onChange={(e) => {
                        const pkg = packages.find((p: any) => p.id === e.target.value);
                        setSelectedPackage(pkg);
                      }}
                    >
                      {packages.map((pkg: any) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} - {formatCurrency(pkg.price, pkg.currency)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Customer ID */}
                <FormControl isRequired>
                  <FormLabel>
                    {selectedCategory === 'airtime' || selectedCategory === 'data'
                      ? 'Phone Number'
                      : selectedCategory === 'electricity'
                      ? 'Meter Number'
                      : selectedCategory === 'cable_tv'
                      ? 'Smart Card Number'
                      : 'Customer ID'}
                  </FormLabel>
                  <HStack>
                    <Input
                      {...paymentForm.register('customer_identifier')}
                      placeholder="Enter customer ID"
                    />
                    <Button onClick={handleValidateCustomer} isLoading={validating}>
                      Validate
                    </Button>
                  </HStack>
                </FormControl>

                {/* Validated Customer Info */}
                {validatedCustomer && (
                  <Card bg="green.50" width="full">
                    <CardBody>
                      <HStack>
                        <Icon as={FiCheckCircle} color="green.500" />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="600">{validatedCustomer.customer_name}</Text>
                          {validatedCustomer.address && (
                            <Text fontSize="sm" color="gray.600">
                              {validatedCustomer.address}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Amount (if not package-based) */}
                {!selectedProvider?.has_packages && (
                  <FormControl isRequired>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      {...paymentForm.register('amount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </FormControl>
                )}

                {/* Wallet Selection */}
                <FormControl isRequired>
                  <FormLabel>Payment Wallet</FormLabel>
                  <Select {...paymentForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* PIN */}
                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...paymentForm.register('pin')}
                    placeholder="Enter your PIN"
                  />
                </FormControl>

                {/* Payment Summary */}
                {(selectedPackage || paymentForm.watch('amount')) && (
                  <Card bg="gray.50" width="full">
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text color="gray.600">Amount</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPackage?.price || paymentForm.watch('amount') || 0,
                              'NGN'
                            )}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.600">Fee</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(selectedProvider?.fee || 0, 'NGN')}
                          </Text>
                        </HStack>
                        <Box borderTop="1px" borderColor="gray.200" pt={2}>
                          <HStack justify="space-between">
                            <Text fontWeight="600">Total</Text>
                            <Text fontWeight="bold" fontSize="lg">
                              {formatCurrency(
                                (selectedPackage?.price || paymentForm.watch('amount') || 0) +
                                  (selectedProvider?.fee || 0),
                                'NGN'
                              )}
                            </Text>
                          </HStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPaymentClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={paying}
                isDisabled={!validatedCustomer}
              >
                Pay Now
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Payment History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingHistory ? (
              <LoadingSpinner />
            ) : payments.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Provider</Th>
                    <Th>Customer ID</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {payments.map((payment: any) => (
                    <Tr key={payment.id}>
                      <Td>{payment.provider_name}</Td>
                      <Td fontFamily="mono" fontSize="sm">
                        {payment.customer_identifier}
                      </Td>
                      <Td fontWeight="600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {formatRelativeTime(payment.created_at)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState
                icon={FiFileText}
                title="No payment history"
                description="Your bill payments will appear here"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onHistoryClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
