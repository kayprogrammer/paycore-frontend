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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  Image,
} from '@chakra-ui/react';
import {
  FiCreditCard,
  FiPlus,
  FiMoreVertical,
  FiLock,
  FiUnlock,
  FiShield,
  FiDollarSign,
  FiGlobe,
  FiShoppingCart,
  FiEye,
  FiEyeOff,
  FiTrash2,
} from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  useListCardsQuery,
  useCreateCardMutation,
  useDeleteCardMutation,
  useFundCardMutation,
  useFreezeCardMutation,
  useUnfreezeCardMutation,
  useBlockCardMutation,
  useActivateCardMutation,
  useUpdateCardControlsMutation,
  useGetCardTransactionsQuery,
} from '@/features/cards/services/cardsApi';
import { useListWalletsQuery } from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatRelativeTime, getStatusColor, maskCardNumber } from '@/utils/formatters';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { KYCRequired } from '@/components/common/KYCRequired';
import { isKYCRequiredError } from '@/utils/errorHandlers';

interface CreateCardForm {
  wallet_id: string;
  card_type: string;
  name_on_card: string;
  brand: string;
}

interface FundCardForm {
  amount: number;
  pin: string;
}

export const CardsPage = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // State
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState<{ [key: string]: boolean }>({});
  const [showCvv, setShowCvv] = useState<{ [key: string]: boolean }>({});

  // Modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isFundOpen, onOpen: onFundOpen, onClose: onFundClose } = useDisclosure();
  const { isOpen: isControlsOpen, onOpen: onControlsOpen, onClose: onControlsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Forms
  const createForm = useForm<CreateCardForm>();
  const fundForm = useForm<FundCardForm>();

  // API
  const { data: cardsData, isLoading, error } = useListCardsQuery();
  const { data: walletsData } = useListWalletsQuery();
  const [createCard, { isLoading: creating }] = useCreateCardMutation();
  const [deleteCard, { isLoading: deleting }] = useDeleteCardMutation();
  const [fundCard, { isLoading: funding }] = useFundCardMutation();
  const [freezeCard] = useFreezeCardMutation();
  const [unfreezeCard] = useUnfreezeCardMutation();
  const [blockCard] = useBlockCardMutation();
  const [activateCard] = useActivateCardMutation();
  const [updateCardControls] = useUpdateCardControlsMutation();

  const cards = cardsData?.data?.data || [];
  const wallets = walletsData?.data?.data || [];

  // Handlers
  const handleCreate = async (data: CreateCardForm) => {
    try {
      await createCard(data).unwrap();
      toast({
        title: 'Card created successfully',
        description: 'Your virtual card is ready to use',
        status: 'success',
        duration: 3000,
      });
      onCreateClose();
      createForm.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to create card',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleFund = async (data: FundCardForm) => {
    if (!selectedCard) return;
    try {
      await fundCard({
        cardId: selectedCard.id,
        data: {
          amount: data.amount,
          wallet_id: selectedCard.wallet_id,
          pin: data.pin,
        },
      }).unwrap();
      toast({
        title: 'Card funded successfully',
        status: 'success',
        duration: 3000,
      });
      onFundClose();
      fundForm.reset();
      setSelectedCard(null);
    } catch (error: any) {
      toast({
        title: 'Failed to fund card',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteCardId) return;
    try {
      await deleteCard(deleteCardId).unwrap();
      toast({
        title: 'Card deleted successfully',
        status: 'success',
        duration: 3000,
      });
      onDeleteClose();
      setDeleteCardId(null);
    } catch (error: any) {
      toast({
        title: 'Failed to delete card',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleFreeze = async (cardId: string, freeze: boolean) => {
    try {
      if (freeze) {
        await freezeCard(cardId).unwrap();
      } else {
        await unfreezeCard(cardId).unwrap();
      }
      toast({
        title: `Card ${freeze ? 'frozen' : 'unfrozen'} successfully`,
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: `Failed to ${freeze ? 'freeze' : 'unfreeze'} card`,
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleBlock = async (cardId: string) => {
    try {
      await blockCard(cardId).unwrap();
      toast({
        title: 'Card blocked successfully',
        description: 'This action cannot be undone',
        status: 'warning',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to block card',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleControlToggle = async (cardId: string, control: string, value: boolean) => {
    try {
      await updateCardControls({
        cardId,
        data: { [control]: value },
      }).unwrap();
      toast({
        title: 'Card controls updated',
        status: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update controls',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const openFundModal = (card: any) => {
    setSelectedCard(card);
    fundForm.reset();
    onFundOpen();
  };

  const openControlsModal = (card: any) => {
    setSelectedCard(card);
    onControlsOpen();
  };

  const openDetailsModal = (card: any) => {
    setSelectedCard(card);
    onDetailsOpen();
  };

  const toggleCardNumber = (cardId: string) => {
    setShowCardNumber((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleCvv = (cardId: string) => {
    setShowCvv((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const getCardBrandColor = (brand: string) => {
    const colors: { [key: string]: string } = {
      visa: 'blue.600',
      mastercard: 'orange.600',
      verve: 'green.600',
    };
    return colors[brand.toLowerCase()] || 'purple.600';
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="220px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error) {
    if (isKYCRequiredError(error)) {
      return (
        <KYCRequired
          title="KYC Verification Required"
          description="To manage your cards, you need to complete your KYC verification first."
        />
      );
    }

    return (
      <Container maxW="container.xl" py={8}>
        <ErrorAlert message="Failed to load cards. Please try again." />
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
              My Cards
            </Heading>
            <Text color="gray.600">Manage your virtual and physical cards</Text>
          </Box>
          <Button leftIcon={<Icon as={FiPlus} />} colorScheme="brand" onClick={onCreateOpen}>
            Create Card
          </Button>
        </HStack>

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {cards.map((card: any) => (
              <Card
                key={card.id}
                bg={`linear-gradient(135deg, ${getCardBrandColor(card.brand)} 0%, ${getCardBrandColor(card.brand).replace('600', '800')} 100%)`}
                color="white"
                position="relative"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
              >
                {/* Card Background Pattern */}
                <Box
                  position="absolute"
                  top="-50%"
                  right="-20%"
                  width="200px"
                  height="200px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                />
                <Box
                  position="absolute"
                  bottom="-30%"
                  left="-10%"
                  width="150px"
                  height="150px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                />

                {/* Card Menu */}
                <Box position="absolute" top={2} right={2} zIndex={1}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<Icon as={FiMoreVertical} />}
                      variant="ghost"
                      size="sm"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    />
                    <MenuList color="gray.800">
                      <MenuItem icon={<Icon as={FiDollarSign} />} onClick={() => openFundModal(card)}>
                        Fund Card
                      </MenuItem>
                      <MenuItem icon={<Icon as={FiShield} />} onClick={() => openControlsModal(card)}>
                        Card Controls
                      </MenuItem>
                      <MenuItem icon={<Icon as={FiEye} />} onClick={() => openDetailsModal(card)}>
                        View Details
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={card.status === 'active' ? FiLock : FiUnlock} />}
                        onClick={() => handleFreeze(card.id, card.status === 'active')}
                      >
                        {card.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        icon={<Icon as={FiShield} />}
                        color="red.500"
                        onClick={() => handleBlock(card.id)}
                      >
                        Block Card
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={FiTrash2} />}
                        color="red.500"
                        onClick={() => {
                          setDeleteCardId(card.id);
                          onDeleteOpen();
                        }}
                      >
                        Delete Card
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>

                <CardBody position="relative" zIndex={1}>
                  <VStack align="stretch" spacing={4} h="full">
                    {/* Card Type & Brand */}
                    <HStack justify="space-between">
                      <Badge colorScheme="whiteAlpha" variant="solid">
                        {card.card_type}
                      </Badge>
                      <Text fontSize="lg" fontWeight="bold" textTransform="uppercase">
                        {card.brand}
                      </Text>
                    </HStack>

                    {/* Card Number */}
                    <Box>
                      <HStack mb={1}>
                        <Text fontSize="xs" opacity={0.8}>
                          Card Number
                        </Text>
                        <IconButton
                          aria-label="Toggle card number"
                          icon={<Icon as={showCardNumber[card.id] ? FiEyeOff : FiEye} />}
                          size="xs"
                          variant="ghost"
                          color="white"
                          onClick={() => toggleCardNumber(card.id)}
                        />
                      </HStack>
                      <Text fontSize="lg" fontFamily="mono" letterSpacing="wide">
                        {showCardNumber[card.id]
                          ? card.card_number.match(/.{1,4}/g)?.join(' ')
                          : maskCardNumber(card.card_number)}
                      </Text>
                    </Box>

                    {/* Card Details */}
                    <HStack justify="space-between">
                      <Box flex={1}>
                        <Text fontSize="xs" opacity={0.8} mb={1}>
                          Card Holder
                        </Text>
                        <Text fontSize="sm" fontWeight="600" textTransform="uppercase">
                          {card.name_on_card}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" opacity={0.8} mb={1}>
                          Expires
                        </Text>
                        <Text fontSize="sm" fontWeight="600">
                          {card.expiry_month}/{card.expiry_year.toString().slice(-2)}
                        </Text>
                      </Box>
                      <Box>
                        <HStack>
                          <Text fontSize="xs" opacity={0.8}>
                            CVV
                          </Text>
                          <IconButton
                            aria-label="Toggle CVV"
                            icon={<Icon as={showCvv[card.id] ? FiEyeOff : FiEye} />}
                            size="xs"
                            variant="ghost"
                            color="white"
                            onClick={() => toggleCvv(card.id)}
                          />
                        </HStack>
                        <Text fontSize="sm" fontWeight="600">
                          {showCvv[card.id] ? card.cvv : '***'}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Balance & Status */}
                    <HStack justify="space-between" pt={2} borderTop="1px" borderColor="whiteAlpha.300">
                      <Box>
                        <Text fontSize="xs" opacity={0.8}>
                          Balance
                        </Text>
                        <Text fontSize="lg" fontWeight="bold">
                          {formatCurrency(card.balance, card.currency)}
                        </Text>
                      </Box>
                      <Badge
                        colorScheme={card.status === 'active' ? 'green' : 'red'}
                        variant="solid"
                      >
                        {card.status}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState
            icon={FiCreditCard}
            title="No cards yet"
            description="Create your first virtual card to start making online payments"
            actionLabel="Create Card"
            onAction={onCreateOpen}
          />
        )}
      </VStack>

      {/* Create Card Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={createForm.handleSubmit(handleCreate)}>
            <ModalHeader>Create New Card</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Select Wallet</FormLabel>
                  <Select {...createForm.register('wallet_id')} placeholder="Choose wallet">
                    {wallets.map((wallet: any) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatCurrency(wallet.balance, wallet.currency)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Card Type</FormLabel>
                  <Select {...createForm.register('card_type')} placeholder="Select type">
                    <option value="virtual">Virtual Card</option>
                    <option value="physical">Physical Card</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Card Brand</FormLabel>
                  <Select {...createForm.register('brand')} placeholder="Select brand">
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="verve">Verve</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Name on Card</FormLabel>
                  <Input
                    {...createForm.register('name_on_card')}
                    placeholder="Enter name as it should appear on card"
                    textTransform="uppercase"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={creating}>
                Create Card
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Fund Card Modal */}
      <Modal isOpen={isFundOpen} onClose={onFundClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={fundForm.handleSubmit(handleFund)}>
            <ModalHeader>Fund Card</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    {...fundForm.register('amount', { valueAsNumber: true })}
                    placeholder="Enter amount"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...fundForm.register('pin')}
                    placeholder="Enter your wallet PIN"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onFundClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={funding}>
                Fund Card
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Card Controls Modal */}
      <Modal isOpen={isControlsOpen} onClose={onControlsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Card Controls</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiGlobe} />
                  <Box>
                    <Text fontWeight="600">International Transactions</Text>
                    <Text fontSize="sm" color="gray.600">
                      Allow payments outside your country
                    </Text>
                  </Box>
                </HStack>
                <Switch
                  isChecked={selectedCard?.international_enabled}
                  onChange={(e) =>
                    handleControlToggle(selectedCard?.id, 'international_enabled', e.target.checked)
                  }
                />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiShoppingCart} />
                  <Box>
                    <Text fontWeight="600">Online Transactions</Text>
                    <Text fontSize="sm" color="gray.600">
                      Enable online shopping and payments
                    </Text>
                  </Box>
                </HStack>
                <Switch
                  isChecked={selectedCard?.online_enabled}
                  onChange={(e) =>
                    handleControlToggle(selectedCard?.id, 'online_enabled', e.target.checked)
                  }
                />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <HStack>
                  <Icon as={FiShield} />
                  <Box>
                    <Text fontWeight="600">ATM Withdrawals</Text>
                    <Text fontSize="sm" color="gray.600">
                      Allow cash withdrawals from ATMs
                    </Text>
                  </Box>
                </HStack>
                <Switch
                  isChecked={selectedCard?.atm_enabled}
                  onChange={(e) =>
                    handleControlToggle(selectedCard?.id, 'atm_enabled', e.target.checked)
                  }
                />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onControlsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Card Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Card Transactions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CardTransactions cardId={selectedCard?.id} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Card</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this card? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={deleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

// Card Transactions Component
const CardTransactions = ({ cardId }: { cardId: string }) => {
  const { data, isLoading } = useGetCardTransactionsQuery(
    { cardId, params: { limit: 10 } },
    { skip: !cardId }
  );

  const transactions = data?.data?.data || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={FiCreditCard}
        title="No transactions yet"
        description="Transactions made with this card will appear here"
      />
    );
  }

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Merchant</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          <Th>Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {transactions.map((txn: any) => (
          <Tr key={txn.id}>
            <Td>{txn.merchant_name || 'Unknown'}</Td>
            <Td fontWeight="600">{formatCurrency(txn.amount, txn.currency)}</Td>
            <Td>
              <Badge colorScheme={getStatusColor(txn.status)}>{txn.status}</Badge>
            </Td>
            <Td fontSize="sm" color="gray.600">
              {formatRelativeTime(txn.created_at)}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
