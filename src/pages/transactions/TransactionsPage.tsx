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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  InputGroup,
  InputLeftElement,
  Textarea,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiSend,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiArrowDownRight,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useListTransactionsQuery,
  useTransferMutation,
  useInitiateDepositMutation,
  useVerifyDepositMutation,
  useInitiateWithdrawalMutation,
  useVerifyBankAccountMutation,
  useGetBanksQuery,
  useCreateDisputeMutation,
  useGetTransactionStatisticsQuery,
} from '@/features/transactions/services/transactionsApi';
import { useListWalletsQuery } from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatDateTime, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';

interface TransferForm {
  wallet_id: string;
  recipient_wallet_id?: string;
  recipient_email?: string;
  amount: number;
  description: string;
  pin: string;
}

interface DepositForm {
  wallet_id: string;
  amount: number;
  payment_method: string;
}

interface WithdrawalForm {
  wallet_id: string;
  amount: number;
  account_number: string;
  bank_code: string;
  account_name?: string;
  pin: string;
}

interface DisputeForm {
  transaction_id: string;
  reason: string;
  description: string;
}

export const TransactionsPage = () => {
  const toast = useToast();

  // State
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [verifiedAccount, setVerifiedAccount] = useState<any>(null);

  // Modals
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  const { isOpen: isDepositOpen, onOpen: onDepositOpen, onClose: onDepositClose } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
  const { isOpen: isDisputeOpen, onOpen: onDisputeOpen, onClose: onDisputeClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Forms
  const transferForm = useForm<TransferForm>();
  const depositForm = useForm<DepositForm>();
  const withdrawForm = useForm<WithdrawalForm>();
  const disputeForm = useForm<DisputeForm>();

  // API
  const { data: transactionsData, isLoading, error, refetch } = useListTransactionsQuery({
    page,
    limit: 20,
    status: filterStatus,
    transaction_type: filterType,
    search: searchQuery,
  });
  const { data: walletsData } = useListWalletsQuery();
  const { data: banksData } = useGetBanksQuery();
  const { data: statsData } = useGetTransactionStatisticsQuery({});
  const [transfer, { isLoading: transferring }] = useTransferMutation();
  const [initiateDeposit, { isLoading: depositing }] = useInitiateDepositMutation();
  const [initiateWithdrawal, { isLoading: withdrawing }] = useInitiateWithdrawalMutation();
  const [verifyBankAccount, { isLoading: verifying }] = useVerifyBankAccountMutation();
  const [createDispute, { isLoading: disputing }] = useCreateDisputeMutation();

  const transactions = transactionsData?.data?.data || [];
  const pagination = transactionsData?.data?.pagination;
  const wallets = walletsData?.data?.data || [];
  const banks = banksData?.data || [];
  const stats = statsData?.data;

  // Handlers
  const handleTransfer = async (data: TransferForm) => {
    try {
      await transfer({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      toast({
        title: 'Transfer successful',
        status: 'success',
        duration: 3000,
      });
      onTransferClose();
      transferForm.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: 'Transfer failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeposit = async (data: DepositForm) => {
    try {
      const result = await initiateDeposit({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      toast({
        title: 'Deposit initiated',
        description: 'Complete the payment to fund your wallet',
        status: 'success',
        duration: 5000,
      });
      // Redirect to payment gateway if needed
      if (result.data?.payment_url) {
        window.open(result.data.payment_url, '_blank');
      }
      onDepositClose();
      depositForm.reset();
    } catch (error: any) {
      toast({
        title: 'Deposit failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleVerifyAccount = async () => {
    const accountNumber = withdrawForm.getValues('account_number');
    const bankCode = withdrawForm.getValues('bank_code');

    if (!accountNumber || !bankCode) {
      toast({
        title: 'Please enter account number and select bank',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await verifyBankAccount({
        account_number: accountNumber,
        bank_code: bankCode,
      }).unwrap();
      setVerifiedAccount(result.data);
      withdrawForm.setValue('account_name', result.data?.account_name);
      toast({
        title: 'Account verified',
        description: `Account Name: ${result.data?.account_name}`,
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.data?.message || 'Could not verify account',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleWithdraw = async (data: WithdrawalForm) => {
    if (!verifiedAccount) {
      toast({
        title: 'Please verify the account first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await initiateWithdrawal({
        ...data,
        amount: Number(data.amount),
      }).unwrap();
      toast({
        title: 'Withdrawal initiated',
        description: 'Your funds will be sent shortly',
        status: 'success',
        duration: 3000,
      });
      onWithdrawClose();
      withdrawForm.reset();
      setVerifiedAccount(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Withdrawal failed',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDispute = async (data: DisputeForm) => {
    try {
      await createDispute(data).unwrap();
      toast({
        title: 'Dispute created',
        description: 'We will review your dispute and get back to you',
        status: 'success',
        duration: 5000,
      });
      onDisputeClose();
      disputeForm.reset();
      setSelectedTransaction(null);
    } catch (error: any) {
      toast({
        title: 'Failed to create dispute',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const openDetailsModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    onDetailsOpen();
  };

  const openDisputeModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    disputeForm.setValue('transaction_id', transaction.id);
    onDisputeOpen();
  };

  if (isLoading && !transactions.length) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <Skeleton height="400px" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>
              Transactions
            </Heading>
            <Text color="gray.600">View and manage your transaction history</Text>
          </Box>
          <HStack>
            <Button leftIcon={<Icon as={FiDownload} />} colorScheme="green" onClick={onDepositOpen}>
              Add Money
            </Button>
            <Button leftIcon={<Icon as={FiUpload} />} variant="outline" onClick={onWithdrawOpen}>
              Withdraw
            </Button>
            <Button leftIcon={<Icon as={FiSend} />} colorScheme="brand" onClick={onTransferOpen}>
              Transfer
            </Button>
          </HStack>
        </HStack>

        {/* Statistics */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Transactions</StatLabel>
                  <StatNumber>{stats.total_transactions}</StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Volume</StatLabel>
                  <StatNumber fontSize="xl">
                    {formatCurrency(stats.total_volume || 0, 'NGN')}
                  </StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Money In</StatLabel>
                  <StatNumber fontSize="xl" color="green.600">
                    {formatCurrency(stats.total_credits || 0, 'NGN')}
                  </StatNumber>
                  <StatHelpText>Credits</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Money Out</StatLabel>
                  <StatNumber fontSize="xl" color="red.600">
                    {formatCurrency(stats.total_debits || 0, 'NGN')}
                  </StatNumber>
                  <StatHelpText>Debits</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4} flexWrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Select
                maxW="200px"
                placeholder="All Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Select>

              <Select
                maxW="200px"
                placeholder="All Types"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="transfer">Transfer</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="bill_payment">Bill Payment</option>
              </Select>

              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('');
                  setFilterType('');
                  refetch();
                }}
              >
                Reset
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardBody>
            {error ? (
              <ErrorAlert message="Failed to load transactions. Please try again." />
            ) : transactions.length > 0 ? (
              <>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Type</Th>
                      <Th>Reference</Th>
                      <Th>Description</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((transaction: any) => (
                      <Tr key={transaction.id}>
                        <Td>
                          <HStack>
                            <Icon
                              as={transaction.type === 'credit' ? FiArrowDownRight : FiArrowUpRight}
                              color={transaction.type === 'credit' ? 'green.500' : 'red.500'}
                            />
                            <Text textTransform="capitalize">
                              {transaction.transaction_type.replace('_', ' ')}
                            </Text>
                          </HStack>
                        </Td>
                        <Td fontFamily="mono" fontSize="sm">
                          {transaction.reference}
                        </Td>
                        <Td maxW="200px" isTruncated>
                          {transaction.description || '-'}
                        </Td>
                        <Td fontWeight="600">
                          <Text color={transaction.type === 'credit' ? 'green.600' : 'red.600'}>
                            {transaction.type === 'credit' ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          {formatRelativeTime(transaction.created_at)}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDetailsModal(transaction)}
                            >
                              View
                            </Button>
                            {transaction.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => openDisputeModal(transaction)}
                              >
                                Dispute
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <HStack justify="center" mt={6} spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      isDisabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {page} of {pagination.total_pages}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      isDisabled={page === pagination.total_pages}
                    >
                      Next
                    </Button>
                  </HStack>
                )}
              </>
            ) : (
              <EmptyState
                icon={FiSend}
                title="No transactions yet"
                description="Your transaction history will appear here"
              />
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Transfer Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={transferForm.handleSubmit(handleTransfer)}>
            <ModalHeader>Send Money</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>From Wallet</FormLabel>
                  <Select {...transferForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Tabs width="full" variant="enclosed">
                  <TabList>
                    <Tab>To Wallet ID</Tab>
                    <Tab>To Email</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <FormControl>
                        <FormLabel>Recipient Wallet ID</FormLabel>
                        <Input
                          {...transferForm.register('recipient_wallet_id')}
                          placeholder="Enter wallet ID"
                        />
                      </FormControl>
                    </TabPanel>
                    <TabPanel px={0}>
                      <FormControl>
                        <FormLabel>Recipient Email</FormLabel>
                        <Input
                          type="email"
                          {...transferForm.register('recipient_email')}
                          placeholder="Enter email address"
                        />
                      </FormControl>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      {...transferForm.register('amount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Input {...transferForm.register('description')} placeholder="What's this for?" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...transferForm.register('pin')}
                    placeholder="Enter your PIN"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onTransferClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={transferring}>
                Send Money
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositOpen} onClose={onDepositClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={depositForm.handleSubmit(handleDeposit)}>
            <ModalHeader>Add Money</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>To Wallet</FormLabel>
                  <Select {...depositForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.currency})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      {...depositForm.register('amount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Payment Method</FormLabel>
                  <Select {...depositForm.register('payment_method')} placeholder="Select method">
                    <option value="card">Card Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="ussd">USSD</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDepositClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={depositing}>
                Continue
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)}>
            <ModalHeader>Withdraw to Bank</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>From Wallet</FormLabel>
                  <Select {...withdrawForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Bank</FormLabel>
                  <Select {...withdrawForm.register('bank_code')} placeholder="Select bank">
                    {banks.map((bank: any) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Account Number</FormLabel>
                  <HStack>
                    <Input {...withdrawForm.register('account_number')} placeholder="0000000000" />
                    <Button onClick={handleVerifyAccount} isLoading={verifying}>
                      Verify
                    </Button>
                  </HStack>
                </FormControl>

                {verifiedAccount && (
                  <FormControl>
                    <FormLabel>Account Name</FormLabel>
                    <Input value={verifiedAccount.account_name} isReadOnly bg="gray.50" />
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput min={0}>
                    <NumberInputField
                      {...withdrawForm.register('amount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...withdrawForm.register('pin')}
                    placeholder="Enter your PIN"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onWithdrawClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={withdrawing}>
                Withdraw
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Dispute Modal */}
      <Modal isOpen={isDisputeOpen} onClose={onDisputeClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={disputeForm.handleSubmit(handleDispute)}>
            <ModalHeader>Create Dispute</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Reason</FormLabel>
                  <Select {...disputeForm.register('reason')} placeholder="Select reason">
                    <option value="unauthorized">Unauthorized Transaction</option>
                    <option value="incorrect_amount">Incorrect Amount</option>
                    <option value="duplicate">Duplicate Transaction</option>
                    <option value="service_not_received">Service Not Received</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...disputeForm.register('description')}
                    placeholder="Provide details about the issue..."
                    rows={5}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDisputeClose}>
                Cancel
              </Button>
              <Button colorScheme="red" type="submit" isLoading={disputing}>
                Submit Dispute
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTransaction && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="gray.600">Reference</Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {selectedTransaction.reference}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Type</Text>
                  <Badge>{selectedTransaction.transaction_type}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Amount</Text>
                  <Text fontWeight="bold" fontSize="lg">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Status</Text>
                  <Badge colorScheme={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Date</Text>
                  <Text fontSize="sm">{formatDateTime(selectedTransaction.created_at)}</Text>
                </HStack>
                {selectedTransaction.description && (
                  <Box>
                    <Text color="gray.600" mb={1}>
                      Description
                    </Text>
                    <Text>{selectedTransaction.description}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};
