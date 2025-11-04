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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  Progress,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiPieChart,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  useListInvestmentProductsQuery,
  useCalculateReturnsMutation,
  useCreateInvestmentMutation,
  useListInvestmentsQuery,
  useLiquidateInvestmentMutation,
  useGetPortfolioQuery,
} from '@/features/investments/services/investmentsApi';
import { useListWalletsQuery } from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatDate, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { KYCRequired } from '@/components/common/KYCRequired';
import { isKYCRequiredError } from '@/utils/errorHandlers';
import { ErrorAlert } from '@/components/common/ErrorAlert';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];
const RISK_COLORS = { low: 'green', medium: 'yellow', high: 'red' };

interface InvestmentForm {
  product_id: string;
  amount: number;
  wallet_id: string;
  pin: string;
}

export const InvestmentsPage = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState(10000);
  const [calculatedReturns, setCalculatedReturns] = useState<any>(null);
  const [liquidateId, setLiquidateId] = useState<string | null>(null);

  const { isOpen: isInvestOpen, onOpen: onInvestOpen, onClose: onInvestClose } = useDisclosure();
  const { isOpen: isCalculatorOpen, onOpen: onCalculatorOpen, onClose: onCalculatorClose } = useDisclosure();
  const { isOpen: isLiquidateOpen, onOpen: onLiquidateOpen, onClose: onLiquidateClose } = useDisclosure();

  const investForm = useForm<InvestmentForm>();

  const { data: productsData, isLoading: loadingProducts, error: productsError } = useListInvestmentProductsQuery({});
  const { data: investmentsData, isLoading: loadingInvestments, error: investmentsError } = useListInvestmentsQuery();
  const { data: portfolioData } = useGetPortfolioQuery();
  const { data: walletsData } = useListWalletsQuery();
  const [calculateReturns, { isLoading: calculating }] = useCalculateReturnsMutation();
  const [createInvestment, { isLoading: investing }] = useCreateInvestmentMutation();
  const [liquidateInvestment, { isLoading: liquidating }] = useLiquidateInvestmentMutation();

  const products = productsData?.data || [];
  const investments = investmentsData?.data?.data || [];
  const portfolio = portfolioData?.data;
  const wallets = walletsData?.data?.data || [];

  const handleCalculate = async () => {
    if (!selectedProduct) return;
    try {
      const result = await calculateReturns({
        product_id: selectedProduct.id,
        amount: investAmount,
        duration_months: selectedProduct.duration_months,
      }).unwrap();
      setCalculatedReturns(result.data);
    } catch (error: any) {
      toast({ title: 'Calculation failed', description: error.data?.message, status: 'error' });
    }
  };

  const handleInvest = async (data: InvestmentForm) => {
    try {
      await createInvestment({ ...data, amount: Number(data.amount) }).unwrap();
      toast({ title: 'Investment created successfully', status: 'success' });
      onInvestClose();
      investForm.reset();
    } catch (error: any) {
      toast({ title: 'Investment failed', description: error.data?.message, status: 'error' });
    }
  };

  const handleLiquidate = async () => {
    if (!liquidateId) return;
    try {
      await liquidateInvestment({ investment_id: liquidateId }).unwrap();
      toast({ title: 'Investment liquidated successfully', status: 'success' });
      onLiquidateClose();
      setLiquidateId(null);
    } catch (error: any) {
      toast({ title: 'Liquidation failed', description: error.data?.message, status: 'error' });
    }
  };

  const portfolioDistribution = investments.map((inv: any) => ({
    name: inv.product_name,
    value: inv.amount,
  }));

  const error = productsError || investmentsError;

  if (error) {
    if (isKYCRequiredError(error)) {
      return (
        <KYCRequired
          title="KYC Verification Required"
          description="To manage your investments, you need to complete your KYC verification first."
        />
      );
    }

    return (
      <Container maxW="container.xl" py={8}>
        <ErrorAlert message="Failed to load investments. Please try again." />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Investments</Heading>
            <Text color="gray.600">Grow your wealth with our investment products</Text>
          </Box>
        </HStack>

        {portfolio && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Invested</StatLabel>
                  <StatNumber fontSize="xl">{formatCurrency(portfolio.total_invested, 'NGN')}</StatNumber>
                  <StatHelpText>{portfolio.total_investments} investments</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Expected Returns</StatLabel>
                  <StatNumber fontSize="xl" color="green.600">{formatCurrency(portfolio.total_returns, 'NGN')}</StatNumber>
                  <StatHelpText>{portfolio.average_return_rate}% avg rate</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Investments</StatLabel>
                  <StatNumber>{portfolio.active_investments}</StatNumber>
                  <StatHelpText>Currently running</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Matured</StatLabel>
                  <StatNumber>{portfolio.matured_investments}</StatNumber>
                  <StatHelpText>Completed</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        <Tabs>
          <TabList>
            <Tab>Investment Products</Tab>
            <Tab>My Investments</Tab>
            <Tab>Portfolio</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {loadingProducts ? (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} height="250px" />)}
                </SimpleGrid>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  {products.map((product: any) => (
                    <Card key={product.id} _hover={{ shadow: 'lg' }}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="md">{product.name}</Heading>
                            <Badge colorScheme={RISK_COLORS[product.risk_level as keyof typeof RISK_COLORS]}>
                              {product.risk_level} risk
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>{product.description}</Text>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between" fontSize="sm">
                              <Text color="gray.600">Minimum Amount</Text>
                              <Text fontWeight="600">{formatCurrency(product.min_amount, 'NGN')}</Text>
                            </HStack>
                            <HStack justify="space-between" fontSize="sm">
                              <Text color="gray.600">Return Rate</Text>
                              <Text fontWeight="600" color="green.600">{product.return_rate}% p.a.</Text>
                            </HStack>
                            <HStack justify="space-between" fontSize="sm">
                              <Text color="gray.600">Duration</Text>
                              <Text fontWeight="600">{product.duration_months} months</Text>
                            </HStack>
                          </VStack>
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline" flex={1} onClick={() => {
                              setSelectedProduct(product);
                              setInvestAmount(product.min_amount);
                              onCalculatorOpen();
                            }}>Calculate</Button>
                            <Button size="sm" colorScheme="brand" flex={1} onClick={() => {
                              setSelectedProduct(product);
                              investForm.setValue('product_id', product.id);
                              onInvestOpen();
                            }}>Invest Now</Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {loadingInvestments ? (
                <LoadingSpinner />
              ) : investments.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {investments.map((inv: any) => (
                    <Card key={inv.id}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Heading size="sm">{inv.product_name}</Heading>
                              <Text fontSize="sm" color="gray.600">Ref: {inv.reference}</Text>
                            </VStack>
                            <Badge colorScheme={getStatusColor(inv.status)} fontSize="sm" px={3} py={1}>
                              {inv.status}
                            </Badge>
                          </HStack>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>Principal</Text>
                              <Text fontWeight="600">{formatCurrency(inv.amount, inv.currency)}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>Expected Returns</Text>
                              <Text fontWeight="600" color="green.600">
                                {formatCurrency(inv.expected_returns, inv.currency)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>Maturity Date</Text>
                              <Text fontWeight="600">{formatDate(inv.maturity_date)}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={1}>Return Rate</Text>
                              <Text fontWeight="600">{inv.return_rate}%</Text>
                            </Box>
                          </SimpleGrid>
                          {inv.status === 'active' && (
                            <Button size="sm" colorScheme="red" variant="outline" onClick={() => {
                              setLiquidateId(inv.id);
                              onLiquidateOpen();
                            }}>
                              Liquidate Early
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <EmptyState icon={FiPieChart} title="No investments yet" description="Start investing to build your portfolio" />
              )}
            </TabPanel>

            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>Portfolio Distribution</Heading>
                    {portfolioDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={portfolioDistribution} cx="50%" cy="50%" labelLine={false}
                            label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                            {portfolioDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value, 'NGN')} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState icon={FiPieChart} title="No data" description="Start investing to see your portfolio distribution" />
                    )}
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>Investment Performance</Heading>
                    {investments.length > 0 ? (
                      <VStack align="stretch" spacing={3}>
                        {investments.slice(0, 5).map((inv: any) => (
                          <Box key={inv.id}>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">{inv.product_name}</Text>
                              <Text fontSize="sm" fontWeight="600">{inv.return_rate}%</Text>
                            </HStack>
                            <Progress value={inv.return_rate} colorScheme="green" size="sm" borderRadius="full" />
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <EmptyState icon={FiTrendingUp} title="No data" />
                    )}
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Calculator Modal */}
      <Modal isOpen={isCalculatorOpen} onClose={onCalculatorClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Returns Calculator</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Investment Amount: {formatCurrency(investAmount, 'NGN')}</FormLabel>
                <Slider value={investAmount} onChange={setInvestAmount}
                  min={selectedProduct?.min_amount || 1000} max={selectedProduct?.max_amount || 1000000} step={1000}>
                  <SliderTrack><SliderFilledTrack bg="brand.500" /></SliderTrack>
                  <SliderThumb boxSize={6} />
                </Slider>
              </FormControl>
              <Button onClick={handleCalculate} isLoading={calculating} colorScheme="brand">Calculate Returns</Button>
              {calculatedReturns && (
                <Card bg="brand.50">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm">Projected Returns</Heading>
                      <HStack justify="space-between">
                        <Text color="gray.600">Principal</Text>
                        <Text fontWeight="600">{formatCurrency(calculatedReturns.principal, 'NGN')}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Returns ({selectedProduct?.return_rate}%)</Text>
                        <Text fontWeight="600" color="green.600">
                          {formatCurrency(calculatedReturns.total_returns, 'NGN')}
                        </Text>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontWeight="600">Total at Maturity</Text>
                        <Text fontWeight="bold" fontSize="lg" color="brand.600">
                          {formatCurrency(calculatedReturns.maturity_value, 'NGN')}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCalculatorClose}>Close</Button>
            <Button colorScheme="brand" onClick={() => {
              onCalculatorClose();
              setSelectedProduct(selectedProduct);
              investForm.setValue('product_id', selectedProduct.id);
              onInvestOpen();
            }}>Invest Now</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Investment Modal */}
      <Modal isOpen={isInvestOpen} onClose={onInvestClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={investForm.handleSubmit(handleInvest)}>
            <ModalHeader>Make Investment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput min={selectedProduct?.min_amount} max={selectedProduct?.max_amount}>
                    <NumberInputField {...investForm.register('amount', { valueAsNumber: true })} placeholder="0.00" />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Source Wallet</FormLabel>
                  <Select {...investForm.register('wallet_id')} placeholder="Select wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input type="password" maxLength={4} {...investForm.register('pin')} placeholder="Enter PIN" />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onInvestClose}>Cancel</Button>
              <Button colorScheme="brand" type="submit" isLoading={investing}>Invest Now</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Liquidate Confirmation */}
      <AlertDialog isOpen={isLiquidateOpen} leastDestructiveRef={cancelRef} onClose={onLiquidateClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Liquidate Investment</AlertDialogHeader>
            <AlertDialogBody>
              Early liquidation may result in penalties. Are you sure you want to proceed?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onLiquidateClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleLiquidate} ml={3} isLoading={liquidating}>
                Liquidate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};
