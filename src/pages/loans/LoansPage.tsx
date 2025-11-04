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
  Progress,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiPercent,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useListLoanProductsQuery,
  useCalculateLoanMutation,
  useCreateLoanApplicationMutation,
  useListLoanApplicationsQuery,
  useMakeRepaymentMutation,
  useGetRepaymentScheduleQuery,
  useEnableAutoRepaymentMutation,
  useDisableAutoRepaymentMutation,
  useGetAutoRepaymentSettingsQuery,
  useGetCreditScoreQuery,
  useGetLoanSummaryQuery,
} from '@/features/loans/services/loansApi';
import { useListWalletsQuery } from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';

interface LoanApplicationForm {
  product_id: string;
  amount: number;
  tenure_months: number;
  purpose: string;
  wallet_id: string;
}

interface RepaymentForm {
  loan_id: string;
  amount: number;
  wallet_id: string;
  pin: string;
}

interface AutoRepaymentForm {
  loan_id: string;
  wallet_id: string;
}

export const LoansPage = () => {
  const toast = useToast();

  // State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [calculatedLoan, setCalculatedLoan] = useState<any>(null);
  const [loanAmount, setLoanAmount] = useState(10000);
  const [loanTenure, setLoanTenure] = useState(3);

  // Modals
  const { isOpen: isApplyOpen, onOpen: onApplyOpen, onClose: onApplyClose } = useDisclosure();
  const { isOpen: isCalculatorOpen, onOpen: onCalculatorOpen, onClose: onCalculatorClose } = useDisclosure();
  const { isOpen: isRepayOpen, onOpen: onRepayOpen, onClose: onRepayClose } = useDisclosure();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();
  const { isOpen: isAutoRepayOpen, onOpen: onAutoRepayOpen, onClose: onAutoRepayClose } = useDisclosure();

  // Forms
  const applyForm = useForm<LoanApplicationForm>();
  const repayForm = useForm<RepaymentForm>();
  const autoRepayForm = useForm<AutoRepaymentForm>();

  // API
  const { data: productsData, isLoading: loadingProducts } = useListLoanProductsQuery({});
  const { data: loansData, isLoading: loadingLoans } = useListLoanApplicationsQuery();
  const { data: walletsData } = useListWalletsQuery();
  const { data: creditScoreData } = useGetCreditScoreQuery();
  const { data: summaryData } = useGetLoanSummaryQuery();
  const [calculateLoan, { isLoading: calculating }] = useCalculateLoanMutation();
  const [createApplication, { isLoading: applying }] = useCreateLoanApplicationMutation();
  const [makeRepayment, { isLoading: repaying }] = useMakeRepaymentMutation();
  const [enableAutoRepay] = useEnableAutoRepaymentMutation();
  const [disableAutoRepay] = useDisableAutoRepaymentMutation();

  const products = productsData?.data || [];
  const loans = loansData?.data?.data || [];
  const wallets = walletsData?.data?.data || [];
  const creditScore = creditScoreData?.data;
  const summary = summaryData?.data;

  // Handlers
  const handleCalculate = async () => {
    if (!selectedProduct) return;

    try {
      const result = await calculateLoan({
        product_id: selectedProduct.id,
        amount: loanAmount,
        tenure_months: loanTenure,
      }).unwrap();
      setCalculatedLoan(result.data);
    } catch (error: any) {
      toast({
        title: 'Calculation failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleApply = async (data: LoanApplicationForm) => {
    try {
      await createApplication({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      toast({
        title: 'Application submitted',
        description: 'Your loan application is being reviewed',
        status: 'success',
        duration: 5000,
      });
      onApplyClose();
      applyForm.reset();
      setSelectedProduct(null);
    } catch (error: any) {
      toast({
        title: 'Application failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleRepayment = async (data: RepaymentForm) => {
    try {
      await makeRepayment({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      toast({
        title: 'Repayment successful',
        status: 'success',
        duration: 3000,
      });
      onRepayClose();
      repayForm.reset();
      setSelectedLoan(null);
    } catch (error: any) {
      toast({
        title: 'Repayment failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleToggleAutoRepay = async (loanId: string, enable: boolean, walletId?: string) => {
    try {
      if (enable && walletId) {
        await enableAutoRepay({ loan_id: loanId, wallet_id: walletId }).unwrap();
      } else {
        await disableAutoRepay(loanId).unwrap();
      }
      toast({
        title: `Auto-repayment ${enable ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update auto-repayment',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const openApplyModal = (product: any) => {
    setSelectedProduct(product);
    applyForm.setValue('product_id', product.id);
    applyForm.setValue('tenure_months', product.min_tenure_months);
    onApplyOpen();
  };

  const openCalculatorModal = (product: any) => {
    setSelectedProduct(product);
    setLoanAmount(product.min_amount);
    setLoanTenure(product.min_tenure_months);
    setCalculatedLoan(null);
    onCalculatorOpen();
  };

  const openRepayModal = (loan: any) => {
    setSelectedLoan(loan);
    repayForm.setValue('loan_id', loan.id);
    onRepayOpen();
  };

  const openScheduleModal = (loan: any) => {
    setSelectedLoan(loan);
    onScheduleOpen();
  };

  if (loadingProducts && loadingLoans) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Loans
          </Heading>
          <Text color="gray.600">Access quick loans and manage repayments</Text>
        </Box>

        {/* Summary Cards */}
        {summary && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Loans</StatLabel>
                  <StatNumber>{summary.active_loans}</StatNumber>
                  <StatHelpText>
                    {formatCurrency(summary.total_outstanding, 'NGN')} outstanding
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Disbursed</StatLabel>
                  <StatNumber fontSize="xl">
                    {formatCurrency(summary.total_disbursed, 'NGN')}
                  </StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Repaid</StatLabel>
                  <StatNumber fontSize="xl">
                    {formatCurrency(summary.total_repaid, 'NGN')}
                  </StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Credit Score</StatLabel>
                  <StatNumber color={creditScore?.score >= 700 ? 'green.500' : 'orange.500'}>
                    {creditScore?.score || 'N/A'}
                  </StatNumber>
                  <StatHelpText>{creditScore?.grade || 'Not rated'}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        <Tabs>
          <TabList>
            <Tab>Available Loans</Tab>
            <Tab>My Loans</Tab>
          </TabList>

          <TabPanels>
            {/* Available Loans */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {loadingProducts ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height="250px" borderRadius="xl" />
                    ))}
                  </SimpleGrid>
                ) : products.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {products.map((product: any) => (
                      <Card key={product.id} transition="all 0.2s" _hover={{ shadow: 'lg' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <Heading size="md">{product.name}</Heading>
                              <Icon as={FiDollarSign} boxSize={6} color="brand.500" />
                            </HStack>

                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {product.description}
                            </Text>

                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Amount Range</Text>
                                <Text fontWeight="600">
                                  {formatCurrency(product.min_amount, 'NGN')} -{' '}
                                  {formatCurrency(product.max_amount, 'NGN')}
                                </Text>
                              </HStack>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Interest Rate</Text>
                                <Text fontWeight="600" color="brand.500">
                                  {product.interest_rate}% p.a.
                                </Text>
                              </HStack>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Tenure</Text>
                                <Text fontWeight="600">
                                  {product.min_tenure_months} - {product.max_tenure_months} months
                                </Text>
                              </HStack>
                            </VStack>

                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                flex={1}
                                onClick={() => openCalculatorModal(product)}
                              >
                                Calculate
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="brand"
                                flex={1}
                                onClick={() => openApplyModal(product)}
                              >
                                Apply Now
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState
                    icon={FiDollarSign}
                    title="No loan products available"
                    description="Check back later for available loan products"
                  />
                )}
              </VStack>
            </TabPanel>

            {/* My Loans */}
            <TabPanel px={0}>
              {loadingLoans ? (
                <LoadingSpinner />
              ) : loans.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {loans.map((loan: any) => (
                    <Card key={loan.id}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Heading size="sm">{loan.product_name}</Heading>
                              <Text fontSize="sm" color="gray.600">
                                Ref: {loan.reference}
                              </Text>
                            </VStack>
                            <Badge
                              colorScheme={getStatusColor(loan.status)}
                              fontSize="sm"
                              px={3}
                              py={1}
                            >
                              {loan.status}
                            </Badge>
                          </HStack>

                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Loan Amount
                              </Text>
                              <Text fontWeight="600">
                                {formatCurrency(loan.amount, loan.currency)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Outstanding
                              </Text>
                              <Text fontWeight="600" color="red.600">
                                {formatCurrency(loan.outstanding_balance, loan.currency)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Monthly Payment
                              </Text>
                              <Text fontWeight="600">
                                {formatCurrency(loan.monthly_payment, loan.currency)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>
                                Next Due Date
                              </Text>
                              <Text fontWeight="600">{formatDate(loan.next_due_date)}</Text>
                            </Box>
                          </SimpleGrid>

                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" color="gray.600">
                                Repayment Progress
                              </Text>
                              <Text fontSize="sm" fontWeight="600">
                                {Math.round((loan.amount_paid / loan.total_repayment) * 100)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={(loan.amount_paid / loan.total_repayment) * 100}
                              colorScheme="brand"
                              borderRadius="full"
                            />
                          </Box>

                          <HStack spacing={2} flexWrap="wrap">
                            {loan.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  colorScheme="brand"
                                  onClick={() => openRepayModal(loan)}
                                >
                                  Make Payment
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openScheduleModal(loan)}>
                                  View Schedule
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <EmptyState
                  icon={FiDollarSign}
                  title="No active loans"
                  description="Apply for a loan to get started"
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Loan Calculator Modal */}
      <Modal isOpen={isCalculatorOpen} onClose={onCalculatorClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loan Calculator - {selectedProduct?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Loan Amount: {formatCurrency(loanAmount, 'NGN')}</FormLabel>
                <Slider
                  value={loanAmount}
                  onChange={setLoanAmount}
                  min={selectedProduct?.min_amount || 1000}
                  max={selectedProduct?.max_amount || 100000}
                  step={1000}
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="brand.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
              </FormControl>

              <FormControl>
                <FormLabel>Tenure: {loanTenure} months</FormLabel>
                <Slider
                  value={loanTenure}
                  onChange={setLoanTenure}
                  min={selectedProduct?.min_tenure_months || 1}
                  max={selectedProduct?.max_tenure_months || 12}
                  step={1}
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="brand.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
              </FormControl>

              <Button onClick={handleCalculate} isLoading={calculating} colorScheme="brand">
                Calculate
              </Button>

              {calculatedLoan && (
                <Card bg="brand.50">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm">Loan Breakdown</Heading>
                      <HStack justify="space-between">
                        <Text color="gray.600">Principal</Text>
                        <Text fontWeight="600">
                          {formatCurrency(calculatedLoan.principal, 'NGN')}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Interest ({selectedProduct?.interest_rate}%)</Text>
                        <Text fontWeight="600">
                          {formatCurrency(calculatedLoan.total_interest, 'NGN')}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontWeight="600">Total Repayment</Text>
                        <Text fontWeight="bold" fontSize="lg" color="brand.600">
                          {formatCurrency(calculatedLoan.total_repayment, 'NGN')}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="600">Monthly Payment</Text>
                        <Text fontWeight="bold" fontSize="lg">
                          {formatCurrency(calculatedLoan.monthly_payment, 'NGN')}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCalculatorClose}>
              Close
            </Button>
            <Button colorScheme="brand" onClick={() => {
              onCalculatorClose();
              openApplyModal(selectedProduct);
            }}>
              Apply for This Loan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Apply for Loan Modal */}
      <Modal isOpen={isApplyOpen} onClose={onApplyClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={applyForm.handleSubmit(handleApply)}>
            <ModalHeader>Apply for Loan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Loan Amount</FormLabel>
                  <NumberInput
                    min={selectedProduct?.min_amount}
                    max={selectedProduct?.max_amount}
                  >
                    <NumberInputField
                      {...applyForm.register('amount', { valueAsNumber: true })}
                      placeholder="Enter amount"
                    />
                  </NumberInput>
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Min: {formatCurrency(selectedProduct?.min_amount, 'NGN')} | Max:{' '}
                    {formatCurrency(selectedProduct?.max_amount, 'NGN')}
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Tenure (Months)</FormLabel>
                  <NumberInput
                    min={selectedProduct?.min_tenure_months}
                    max={selectedProduct?.max_tenure_months}
                  >
                    <NumberInputField
                      {...applyForm.register('tenure_months', { valueAsNumber: true })}
                      placeholder="Enter tenure"
                    />
                  </NumberInput>
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Min: {selectedProduct?.min_tenure_months} | Max:{' '}
                    {selectedProduct?.max_tenure_months} months
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Purpose</FormLabel>
                  <Select {...applyForm.register('purpose')} placeholder="Select purpose">
                    <option value="business">Business</option>
                    <option value="personal">Personal</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Disbursement Wallet</FormLabel>
                  <Select {...applyForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.currency})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onApplyClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={applying}>
                Submit Application
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Repayment Modal */}
      <Modal isOpen={isRepayOpen} onClose={onRepayClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={repayForm.handleSubmit(handleRepayment)}>
            <ModalHeader>Make Loan Repayment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {selectedLoan && (
                  <Card bg="gray.50" width="full">
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text color="gray.600">Outstanding Balance</Text>
                          <Text fontWeight="bold" color="red.600">
                            {formatCurrency(selectedLoan.outstanding_balance, selectedLoan.currency)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.600">Next Payment Due</Text>
                          <Text fontWeight="600">
                            {formatCurrency(selectedLoan.monthly_payment, selectedLoan.currency)}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <FormControl isRequired>
                  <FormLabel>Payment Amount</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      {...repayForm.register('amount', { valueAsNumber: true })}
                      placeholder="Enter amount"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Payment Wallet</FormLabel>
                  <Select {...repayForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...repayForm.register('pin')}
                    placeholder="Enter PIN"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onRepayClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={repaying}>
                Make Payment
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Repayment Schedule Modal */}
      <Modal isOpen={isScheduleOpen} onClose={onScheduleClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Repayment Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RepaymentSchedule loanId={selectedLoan?.id} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onScheduleClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

// Repayment Schedule Component
const RepaymentSchedule = ({ loanId }: { loanId: string }) => {
  const { data, isLoading } = useGetRepaymentScheduleQuery(loanId, { skip: !loanId });
  const schedule = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (schedule.length === 0) {
    return <EmptyState icon={FiCalendar} title="No schedule available" />;
  }

  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Period</Th>
          <Th>Due Date</Th>
          <Th isNumeric>Amount</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {schedule.map((item: any, index: number) => (
          <Tr key={item.id}>
            <Td>{index + 1}</Td>
            <Td>{formatDate(item.due_date)}</Td>
            <Td isNumeric fontWeight="600">
              {formatCurrency(item.amount, item.currency)}
            </Td>
            <Td>
              <Badge colorScheme={getStatusColor(item.status)}>{item.status}</Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
