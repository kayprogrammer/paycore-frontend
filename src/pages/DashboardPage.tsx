import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  SimpleGrid,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { FiTrendingUp, FiSend, FiDownload, FiFileText, FiCreditCard, FiPieChart, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGetWalletSummaryQuery } from '@/features/wallets/services/walletsApi';
import { useListTransactionsQuery, useGetTransactionStatisticsQuery } from '@/features/transactions/services/transactionsApi';
import { useGetLoanSummaryQuery } from '@/features/loans/services/loansApi';
import { useGetPortfolioQuery } from '@/features/investments/services/investmentsApi';
import { useGetCurrentKYCLevelQuery } from '@/features/compliance/services/complianceApi';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { KYCRequired } from '@/components/common/KYCRequired';
import { useNavigate } from 'react-router-dom';
import { isKYCRequiredError } from '@/utils/errorHandlers';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444'];

export const DashboardPage = () => {
  const navigate = useNavigate();

  // Fetch data
  const { data: walletSummary, isLoading: loadingWallets, error: walletError } = useGetWalletSummaryQuery();
  const { data: transactionsData, isLoading: loadingTransactions } = useListTransactionsQuery({ limit: 5 });
  const { data: statisticsData, isLoading: loadingStats } = useGetTransactionStatisticsQuery({});
  const { data: loanSummary, isLoading: loadingLoans } = useGetLoanSummaryQuery();
  const { data: portfolio, isLoading: loadingInvestments } = useGetPortfolioQuery();
  const { data: kycLevel } = useGetCurrentKYCLevelQuery();

  const walletData = walletSummary?.data;
  const transactions = transactionsData?.data?.data || [];
  const statistics = statisticsData?.data;
  const loans = loanSummary?.data;
  const investments = portfolio?.data;
  const kyc = kycLevel?.data;

  // Prepare chart data
  const transactionTrend = statistics?.daily_statistics?.map((stat: any) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: stat.total_amount,
    count: stat.count,
  })) || [];

  const walletDistribution = [
    { name: 'Main Wallet', value: walletData?.total_balance || 0 },
    { name: 'Loans', value: loans?.total_disbursed || 0 },
    { name: 'Investments', value: investments?.total_invested || 0 },
  ];

  const quickActions = [
    {
      icon: FiSend,
      label: 'Send Money',
      description: 'Transfer to wallets or banks',
      color: 'brand',
      onClick: () => navigate('/transactions'),
    },
    {
      icon: FiDownload,
      label: 'Add Money',
      description: 'Fund your wallet',
      color: 'green',
      onClick: () => navigate('/transactions'),
    },
    {
      icon: FiFileText,
      label: 'Pay Bills',
      description: 'Airtime, data, utilities',
      color: 'purple',
      onClick: () => navigate('/bills'),
    },
    {
      icon: FiPieChart,
      label: 'Invest',
      description: 'Grow your wealth',
      color: 'orange',
      onClick: () => navigate('/investments'),
    },
  ];

  if (loadingWallets) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="200px" borderRadius="xl" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="120px" borderRadius="lg" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" borderRadius="xl" />
        </VStack>
      </Container>
    );
  }

  if (walletError) {
    if (isKYCRequiredError(walletError)) {
      return (
        <KYCRequired
          title="KYC Verification Required"
          description="To access your wallet and start using PayCore, you need to complete your KYC verification first."
        />
      );
    }

    return (
      <Container maxW="container.xl" py={8}>
        <ErrorAlert message="Failed to load dashboard data. Please try again." />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600">Welcome back! Here's your financial overview.</Text>
        </Box>

        {/* KYC Alert */}
        {kyc && kyc.current_level !== 'TIER_3' && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Complete Your Verification</AlertTitle>
              <AlertDescription>
                You're currently at {kyc.current_level}. Upgrade to unlock higher limits and more features.
              </AlertDescription>
            </Box>
            <Button
              colorScheme="orange"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Verify Now
            </Button>
          </Alert>
        )}

        {/* Wallet Summary */}
        <Card bgGradient="linear(to-br, brand.500, brand.700)" color="white" shadow="xl">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" opacity={0.9}>
                    Total Balance
                  </Text>
                  <Heading size="2xl">
                    {formatCurrency(walletData?.total_balance || 0, walletData?.currency || 'NGN')}
                  </Heading>
                  <Text fontSize="sm" opacity={0.8}>
                    Across {walletData?.total_wallets || 0} wallet{walletData?.total_wallets !== 1 ? 's' : ''}
                  </Text>
                </VStack>
                <Icon as={MdAccountBalanceWallet} boxSize={16} opacity={0.2} />
              </HStack>

              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} pt={4} borderTop="1px" borderColor="whiteAlpha.300">
                <Box>
                  <Text fontSize="xs" opacity={0.8} mb={1}>
                    Available
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatCurrency(walletData?.available_balance || 0, walletData?.currency || 'NGN')}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" opacity={0.8} mb={1}>
                    On Hold
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatCurrency(walletData?.total_holds || 0, walletData?.currency || 'NGN')}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" opacity={0.8} mb={1}>
                    Active Cards
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {walletData?.active_wallets || 0}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Box>
          <Heading size="md" mb={4}>
            Quick Actions
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {quickActions.map((action) => (
              <Card
                key={action.label}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                onClick={action.onClick}
              >
                <CardBody>
                  <VStack spacing={3}>
                    <Icon
                      as={action.icon}
                      boxSize={8}
                      color={`${action.color}.500`}
                    />
                    <VStack spacing={1}>
                      <Text fontWeight="600" fontSize="sm">
                        {action.label}
                      </Text>
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        {action.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Transactions</StatLabel>
                <StatNumber>{statistics?.total_transactions || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {statistics?.growth_percentage || 0}% this month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Loans</StatLabel>
                <StatNumber>{loans?.active_loans || 0}</StatNumber>
                <StatHelpText>
                  {formatCurrency(loans?.total_outstanding || 0, 'NGN')} outstanding
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Investments</StatLabel>
                <StatNumber>{investments?.total_investments || 0}</StatNumber>
                <StatHelpText>
                  {formatCurrency(investments?.total_invested || 0, 'NGN')} invested
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Expected Returns</StatLabel>
                <StatNumber fontSize="xl">
                  {formatCurrency(investments?.total_returns || 0, 'NGN')}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {investments?.average_return_rate || 0}% avg rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>
                  Transaction Trend
                </Heading>
                {loadingStats ? (
                  <Skeleton height="300px" />
                ) : transactionTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={transactionTrend}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366F1"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={FiTrendingUp}
                    title="No transaction data yet"
                    description="Start making transactions to see your trends"
                  />
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <Heading size="sm" mb={4}>
                  Portfolio Distribution
                </Heading>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={walletDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {walletDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, 'NGN')} />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Recent Transactions */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="sm">Recent Transactions</Heading>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<Icon as={FiArrowUpRight} />}
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </HStack>

            {loadingTransactions ? (
              <VStack spacing={3}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonText key={i} noOfLines={2} spacing={2} width="100%" />
                ))}
              </VStack>
            ) : transactions.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Reference</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
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
                          <Text textTransform="capitalize">{transaction.transaction_type}</Text>
                        </HStack>
                      </Td>
                      <Td fontFamily="mono" fontSize="sm">
                        {transaction.reference}
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
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState
                icon={FiFileText}
                title="No transactions yet"
                description="Your recent transactions will appear here"
              />
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};
