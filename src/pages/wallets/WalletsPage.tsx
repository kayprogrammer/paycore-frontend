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
  PinInput,
  PinInputField,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiShield,
  FiStar,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  useListWalletsQuery,
  useCreateWalletMutation,
  useUpdateWalletMutation,
  useDeleteWalletMutation,
  useSetDefaultWalletMutation,
  useSetPinMutation,
  useChangePinMutation,
  useEnableBiometricMutation,
  useDisableBiometricMutation,
  useGetSecurityStatusQuery,
  useChangeWalletStatusMutation,
} from '@/features/wallets/services/walletsApi';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';

interface CreateWalletForm {
  name: string;
  currency: string;
  type: string;
}

interface PinForm {
  pin: string;
  confirm_pin: string;
  old_pin?: string;
}

export const WalletsPage = () => {
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // State
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);
  const [pinAction, setPinAction] = useState<'set' | 'change' | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isPinOpen, onOpen: onPinOpen, onClose: onPinClose } = useDisclosure();
  const { isOpen: isSecurityOpen, onOpen: onSecurityOpen, onClose: onSecurityClose } = useDisclosure();

  // Forms
  const createForm = useForm<CreateWalletForm>();
  const editForm = useForm<CreateWalletForm>();
  const pinForm = useForm<PinForm>();

  // API
  const { data: walletsData, isLoading, error } = useListWalletsQuery();
  const [createWallet, { isLoading: creating }] = useCreateWalletMutation();
  const [updateWallet, { isLoading: updating }] = useUpdateWalletMutation();
  const [deleteWallet, { isLoading: deleting }] = useDeleteWalletMutation();
  const [setDefaultWallet] = useSetDefaultWalletMutation();
  const [setPin, { isLoading: settingPin }] = useSetPinMutation();
  const [changePin, { isLoading: changingPin }] = useChangePinMutation();
  const [enableBiometric] = useEnableBiometricMutation();
  const [disableBiometric] = useDisableBiometricMutation();
  const [changeStatus] = useChangeWalletStatusMutation();

  const wallets = walletsData?.data?.data || [];

  // Handlers
  const handleCreate = async (data: CreateWalletForm) => {
    try {
      await createWallet(data).unwrap();
      toast({
        title: 'Wallet created successfully',
        status: 'success',
        duration: 3000,
      });
      onCreateClose();
      createForm.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to create wallet',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleEdit = async (data: CreateWalletForm) => {
    if (!selectedWallet) return;
    try {
      await updateWallet({ id: selectedWallet.id, data }).unwrap();
      toast({
        title: 'Wallet updated successfully',
        status: 'success',
        duration: 3000,
      });
      onEditClose();
      setSelectedWallet(null);
    } catch (error: any) {
      toast({
        title: 'Failed to update wallet',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteWalletId) return;
    try {
      await deleteWallet(deleteWalletId).unwrap();
      toast({
        title: 'Wallet deleted successfully',
        status: 'success',
        duration: 3000,
      });
      onDeleteClose();
      setDeleteWalletId(null);
    } catch (error: any) {
      toast({
        title: 'Failed to delete wallet',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSetDefault = async (walletId: string) => {
    try {
      await setDefaultWallet(walletId).unwrap();
      toast({
        title: 'Default wallet set successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to set default wallet',
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePinSubmit = async (data: PinForm) => {
    if (!selectedWallet) return;

    if (data.pin !== data.confirm_pin) {
      toast({
        title: 'PINs do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      if (pinAction === 'set') {
        await setPin({
          walletId: selectedWallet.id,
          data: { pin: data.pin },
        }).unwrap();
      } else {
        await changePin({
          walletId: selectedWallet.id,
          data: { old_pin: data.old_pin!, new_pin: data.pin },
        }).unwrap();
      }
      toast({
        title: `PIN ${pinAction === 'set' ? 'set' : 'changed'} successfully`,
        status: 'success',
        duration: 3000,
      });
      onPinClose();
      pinForm.reset();
      setSelectedWallet(null);
      setPinAction(null);
    } catch (error: any) {
      toast({
        title: `Failed to ${pinAction} PIN`,
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleToggleBiometric = async (walletId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableBiometric(walletId).unwrap();
      } else {
        await disableBiometric(walletId).unwrap();
      }
      toast({
        title: `Biometric ${enabled ? 'enabled' : 'disabled'} successfully`,
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: `Failed to ${enabled ? 'enable' : 'disable'} biometric`,
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleFreezeWallet = async (walletId: string, freeze: boolean) => {
    try {
      await changeStatus({
        walletId,
        status: freeze ? 'frozen' : 'active',
      }).unwrap();
      toast({
        title: `Wallet ${freeze ? 'frozen' : 'unfrozen'} successfully`,
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: `Failed to ${freeze ? 'freeze' : 'unfreeze'} wallet`,
        description: error.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const openEditModal = (wallet: any) => {
    setSelectedWallet(wallet);
    editForm.reset({
      name: wallet.name,
      currency: wallet.currency,
      type: wallet.type,
    });
    onEditOpen();
  };

  const openPinModal = (wallet: any, action: 'set' | 'change') => {
    setSelectedWallet(wallet);
    setPinAction(action);
    pinForm.reset();
    onPinOpen();
  };

  const openSecurityModal = (wallet: any) => {
    setSelectedWallet(wallet);
    onSecurityOpen();
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <ErrorAlert message="Failed to load wallets. Please try again." />
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
              My Wallets
            </Heading>
            <Text color="gray.600">Manage your wallets and security settings</Text>
          </Box>
          <HStack>
            <IconButton
              aria-label="Toggle balance visibility"
              icon={<Icon as={showBalance ? FiEye : FiEyeOff} />}
              variant="ghost"
              onClick={() => setShowBalance(!showBalance)}
            />
            <Button leftIcon={<Icon as={FiPlus} />} colorScheme="brand" onClick={onCreateOpen}>
              Create Wallet
            </Button>
          </HStack>
        </HStack>

        {/* Wallets Grid */}
        {wallets.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {wallets.map((wallet: any) => (
              <Card
                key={wallet.id}
                position="relative"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              >
                {wallet.is_default && (
                  <Box
                    position="absolute"
                    top={2}
                    left={2}
                    bg="brand.500"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="600"
                  >
                    <Icon as={FiStar} mr={1} />
                    Default
                  </Box>
                )}

                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={1}
                >
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<Icon as={FiMoreVertical} />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<Icon as={FiEdit} />} onClick={() => openEditModal(wallet)}>
                        Edit
                      </MenuItem>
                      {!wallet.is_default && (
                        <MenuItem icon={<Icon as={FiStar} />} onClick={() => handleSetDefault(wallet.id)}>
                          Set as Default
                        </MenuItem>
                      )}
                      <MenuItem
                        icon={<Icon as={FiShield} />}
                        onClick={() => openSecurityModal(wallet)}
                      >
                        Security Settings
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={wallet.status === 'active' ? FiLock : FiUnlock} />}
                        onClick={() => handleFreezeWallet(wallet.id, wallet.status === 'active')}
                      >
                        {wallet.status === 'active' ? 'Freeze' : 'Unfreeze'}
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        icon={<Icon as={FiTrash2} />}
                        color="red.500"
                        onClick={() => {
                          setDeleteWalletId(wallet.id);
                          onDeleteOpen();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>

                <CardBody pt={12}>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={MdAccountBalanceWallet} boxSize={6} color="brand.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="600" fontSize="lg">
                          {wallet.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500" textTransform="uppercase">
                          {wallet.currency} • {wallet.type}
                        </Text>
                      </VStack>
                    </HStack>

                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Available Balance
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {showBalance
                          ? formatCurrency(wallet.balance, wallet.currency)
                          : '••••••'}
                      </Text>
                    </Box>

                    <HStack justify="space-between" pt={2} borderTop="1px" borderColor="gray.100">
                      <Badge colorScheme={getStatusColor(wallet.status)}>{wallet.status}</Badge>
                      <Text fontSize="xs" color="gray.500">
                        {formatRelativeTime(wallet.created_at)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState
            icon={MdAccountBalanceWallet}
            title="No wallets yet"
            description="Create your first wallet to start managing your funds"
            actionLabel="Create Wallet"
            onAction={onCreateOpen}
          />
        )}
      </VStack>

      {/* Create Wallet Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={createForm.handleSubmit(handleCreate)}>
            <ModalHeader>Create New Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Wallet Name</FormLabel>
                  <Input {...createForm.register('name')} placeholder="e.g., Personal Wallet" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Currency</FormLabel>
                  <Select {...createForm.register('currency')} placeholder="Select currency">
                    <option value="NGN">Nigerian Naira (NGN)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet Type</FormLabel>
                  <Select {...createForm.register('type')} placeholder="Select type">
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="savings">Savings</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" type="submit" isLoading={creating}>
                Create Wallet
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Wallet Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <ModalHeader>Edit Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Wallet Name</FormLabel>
                  <Input {...editForm.register('name')} />
                </FormControl>

                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Input {...editForm.register('currency')} disabled />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet Type</FormLabel>
                  <Select {...editForm.register('type')}>
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="savings">Savings</option>
                  </Select>
                </FormControl>
              </VStack>
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

      {/* Security Settings Modal */}
      <Modal isOpen={isSecurityOpen} onClose={onSecurityClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Security Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Box>
                    <Text fontWeight="600">PIN Protection</Text>
                    <Text fontSize="sm" color="gray.600">
                      Secure your wallet with a PIN
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPinModal(selectedWallet, 'set')}
                  >
                    Set PIN
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPinModal(selectedWallet, 'change')}
                  >
                    Change PIN
                  </Button>
                </HStack>
              </Box>

              <Divider />

              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="600">Biometric Authentication</Text>
                  <Text fontSize="sm" color="gray.600">
                    Use fingerprint or face recognition
                  </Text>
                </Box>
                <Switch
                  isChecked={selectedWallet?.biometric_enabled}
                  onChange={(e) =>
                    handleToggleBiometric(selectedWallet?.id, e.target.checked)
                  }
                />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSecurityClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* PIN Modal */}
      <Modal isOpen={isPinOpen} onClose={onPinClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={pinForm.handleSubmit(handlePinSubmit)}>
            <ModalHeader>{pinAction === 'set' ? 'Set' : 'Change'} PIN</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {pinAction === 'change' && (
                  <FormControl isRequired>
                    <FormLabel>Old PIN</FormLabel>
                    <Input
                      type="password"
                      maxLength={4}
                      {...pinForm.register('old_pin')}
                      placeholder="Enter old PIN"
                    />
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel>New PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...pinForm.register('pin')}
                    placeholder="Enter 4-digit PIN"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm PIN</FormLabel>
                  <Input
                    type="password"
                    maxLength={4}
                    {...pinForm.register('confirm_pin')}
                    placeholder="Re-enter PIN"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPinClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                type="submit"
                isLoading={settingPin || changingPin}
              >
                {pinAction === 'set' ? 'Set PIN' : 'Change PIN'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Wallet</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this wallet? This action cannot be undone.
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
