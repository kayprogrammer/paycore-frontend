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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  SkeletonText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  IconButton,
  Flex,
  Avatar,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
} from '@chakra-ui/react';
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  useListTicketsQuery,
  useGetTicketMessagesQuery,
  useAddMessageMutation,
  useCloseTicketMutation,
} from '@/features/support/services/supportApi';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { formatRelativeTime } from '@/utils/formatters';
import { EmptyState } from '@/components/common/EmptyState';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'open':
      return FiClock;
    case 'in_progress':
      return FiMessageCircle;
    case 'resolved':
      return FiCheckCircle;
    case 'closed':
      return FiCheckCircle;
    default:
      return FiAlertCircle;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'blue';
    case 'in_progress':
      return 'purple';
    case 'waiting_for_customer':
      return 'orange';
    case 'resolved':
      return 'green';
    case 'closed':
      return 'gray';
    default:
      return 'gray';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'blue';
    case 'low':
      return 'gray';
    default:
      return 'gray';
  }
};

export const TicketsPage = () => {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen: isTicketOpen, onOpen: onTicketOpen, onClose: onTicketClose } = useDisclosure();

  // Fetch tickets
  const { data: ticketsData, isLoading: loadingTickets } = useListTicketsQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  // Fetch messages for selected ticket
  const { data: messagesData, refetch: refetchMessages } = useGetTicketMessagesQuery(
    { ticketId: selectedTicketId!, params: { limit: 100 } },
    { skip: !selectedTicketId, pollingInterval: 3000 }
  );

  // API mutations
  const [addMessage, { isLoading: sendingMessage }] = useAddMessageMutation();
  const [closeTicket, { isLoading: closingTicket }] = useCloseTicketMutation();

  // Backend returns tickets and messages in data.data (nested structure)
  const tickets = (ticketsData?.data as any)?.data || [];
  const messages = (messagesData?.data as any)?.data || [];
  const selectedTicket = tickets.find((t: any) => t.ticket_id === selectedTicketId);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    onTicketOpen();
  };

  const handleCloseTicketModal = () => {
    onTicketClose();
    setSelectedTicketId(null);
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTicketId) return;

    try {
      await addMessage({
        ticketId: selectedTicketId,
        data: { message: message.trim() },
      }).unwrap();

      setMessage('');
      refetchMessages();

      toast({
        title: 'Message sent',
        status: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicketId) return;

    try {
      await closeTicket(selectedTicketId).unwrap();

      toast({
        title: 'Ticket closed',
        description: 'This ticket has been marked as closed',
        status: 'success',
        duration: 3000,
      });

      handleCloseTicketModal();
    } catch (error: any) {
      toast({
        title: 'Failed to close ticket',
        description: error?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Support Tickets
          </Heading>
          <Text color="gray.600">
            View and manage your support tickets
          </Text>
        </Box>

        {/* Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Box flex="1">
                <Select
                  placeholder="All Statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_customer">Waiting for Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Select>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardBody>
            {loadingTickets ? (
              <VStack spacing={4} align="stretch">
                {[1, 2, 3].map((i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="md">
                    <Skeleton height="20px" width="60%" mb={2} />
                    <SkeletonText noOfLines={2} spacing={2} />
                  </Box>
                ))}
              </VStack>
            ) : tickets.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Category</Th>
                    <Th>Status</Th>
                    <Th>Priority</Th>
                    <Th>Created</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tickets.map((ticket: any) => (
                    <Tr key={ticket.ticket_id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600">{ticket.subject}</Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {ticket.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" textTransform="capitalize">
                          {ticket.category?.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(ticket.status)}>
                          {ticket.status?.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {formatRelativeTime(ticket.created_at)}
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          variant="ghost"
                          onClick={() => handleViewTicket(ticket.ticket_id)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <EmptyState
                icon={FiMessageCircle}
                title="No tickets found"
                description="You haven't created any support tickets yet"
              />
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Ticket Details Modal */}
      <Modal isOpen={isTicketOpen} onClose={handleCloseTicketModal} size="xl">
        <ModalOverlay />
        <ModalContent maxH="700px">
          <ModalHeader>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <HStack>
                  <FiMessageCircle />
                  <Text>Ticket Details</Text>
                </HStack>
                <IconButton
                  icon={<FiX />}
                  aria-label="Close"
                  size="sm"
                  variant="ghost"
                  onClick={handleCloseTicketModal}
                />
              </HStack>
              {selectedTicket && (
                <Box>
                  <Text fontSize="lg" fontWeight="600">
                    {selectedTicket.subject}
                  </Text>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge colorScheme={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Badge colorScheme="purple" textTransform="capitalize">
                      {selectedTicket.category?.replace(/_/g, ' ')}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      Created {formatRelativeTime(selectedTicket.created_at)}
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalHeader>
          <ModalBody pb={4}>
            <VStack align="stretch" spacing={4} height="450px">
              {/* Messages Container */}
              <Box
                flex="1"
                overflowY="auto"
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="gray.50"
              >
                {messages.length === 0 ? (
                  <VStack spacing={2} py={8}>
                    <FiMessageCircle size={48} color="gray.400" />
                    <Text color="gray.600">No messages yet</Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {messages.map((msg: any) => {
                      // Backend uses is_from_customer instead of sender_type
                      const isCustomer = msg.is_from_customer;
                      return (
                        <Flex
                          key={msg.message_id || msg.id}
                          justify={isCustomer ? 'flex-end' : 'flex-start'}
                        >
                          <HStack
                            spacing={2}
                            maxW="70%"
                            flexDirection={isCustomer ? 'row-reverse' : 'row'}
                          >
                            <Avatar
                              size="sm"
                              name={msg.sender_email}
                              bg={isCustomer ? 'brand.500' : 'green.500'}
                            />
                            <Box
                              bg={isCustomer ? 'brand.500' : 'white'}
                              color={isCustomer ? 'white' : 'black'}
                              px={4}
                              py={2}
                              borderRadius="lg"
                              boxShadow="sm"
                            >
                              <Text fontSize="sm">{msg.message}</Text>
                              <Text fontSize="xs" opacity={0.7} mt={1}>
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </Text>
                            </Box>
                          </HStack>
                        </Flex>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Message Input - Only show if ticket is not closed */}
              {selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' ? (
                <VStack spacing={2}>
                  <HStack width="100%">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                    />
                    <IconButton
                      icon={<FiSend />}
                      aria-label="Send message"
                      colorScheme="brand"
                      onClick={handleSendMessage}
                      isLoading={sendingMessage}
                      isDisabled={!message.trim() || sendingMessage}
                    />
                  </HStack>
                  <HStack width="100%" justify="flex-end">
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={handleCloseTicket}
                      isLoading={closingTicket}
                    >
                      Close Ticket
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Box
                  p={4}
                  bg="gray.100"
                  borderRadius="md"
                  textAlign="center"
                >
                  <Text color="gray.600" fontSize="sm">
                    This ticket is {selectedTicket?.status}. No further messages can be sent.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};
