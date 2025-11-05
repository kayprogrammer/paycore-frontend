import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Divider,
} from '@chakra-ui/react';
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiBook,
  FiHelpCircle,
  FiExternalLink,
} from 'react-icons/fi';

export const SupportPage = () => {
  const faqs = [
    {
      question: 'How do I create a wallet?',
      answer:
        'Navigate to the Wallets page and click "Create Wallet". Choose your desired currency and wallet type, then follow the prompts to complete the setup.',
    },
    {
      question: 'How long does KYC verification take?',
      answer:
        'KYC verification typically takes 15 seconds to a few minutes for automatic approval. In some cases, manual review may be required which can take up to 24-48 hours.',
    },
    {
      question: 'What are the transaction limits?',
      answer:
        'Transaction limits depend on your KYC level. TIER_0 has basic limits, while TIER_2 and TIER_3 offer higher transaction limits for verified users.',
    },
    {
      question: 'How do I apply for a loan?',
      answer:
        'Go to the Loans page, browse available loan products, and click "Apply Now" on your preferred option. Fill in the required information and submit your application for review.',
    },
    {
      question: 'Are my funds secure?',
      answer:
        'Yes, we use industry-standard encryption and security measures to protect your funds. All transactions are monitored for suspicious activity, and we comply with financial regulations.',
    },
    {
      question: 'How do I reset my PIN?',
      answer:
        'You can reset your PIN from the Settings page under Security settings. You will need to verify your identity before creating a new PIN.',
    },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Support Center
          </Heading>
          <Text color="gray.600">
            Get help and find answers to your questions
          </Text>
        </Box>

        {/* Contact Options */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <VStack spacing={4} align="start">
                <Icon as={FiMail} boxSize={8} color="brand.500" />
                <Box>
                  <Heading size="sm" mb={1}>
                    Email Support
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Get help via email
                  </Text>
                  <Link
                    href="mailto:support@paycore.com"
                    color="brand.500"
                    fontSize="sm"
                  >
                    support@paycore.com
                  </Link>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="start">
                <Icon as={FiPhone} boxSize={8} color="brand.500" />
                <Box>
                  <Heading size="sm" mb={1}>
                    Phone Support
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Call us during business hours
                  </Text>
                  <Link href="tel:+2341234567890" color="brand.500" fontSize="sm">
                    +234 123 456 7890
                  </Link>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="start">
                <Icon as={FiMessageCircle} boxSize={8} color="brand.500" />
                <Box>
                  <Heading size="sm" mb={1}>
                    Live Chat
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Chat with our support team
                  </Text>
                  <Button size="sm" colorScheme="brand" rightIcon={<FiExternalLink />}>
                    Start Chat
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* FAQs */}
        <Box>
          <HStack spacing={3} mb={6}>
            <Icon as={FiHelpCircle} boxSize={6} color="brand.500" />
            <Heading size="md">Frequently Asked Questions</Heading>
          </HStack>

          <Accordion allowToggle>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left" fontWeight="600">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} color="gray.600">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        <Divider />

        {/* Resources */}
        <Box>
          <HStack spacing={3} mb={6}>
            <Icon as={FiBook} boxSize={6} color="brand.500" />
            <Heading size="md">Additional Resources</Heading>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Card variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="sm" mb={1}>
                      User Guide
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Learn how to use all features
                    </Text>
                  </Box>
                  <Icon as={FiExternalLink} color="brand.500" />
                </HStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="sm" mb={1}>
                      API Documentation
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      For developers and integrations
                    </Text>
                  </Box>
                  <Icon as={FiExternalLink} color="brand.500" />
                </HStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="sm" mb={1}>
                      Security & Privacy
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Learn about our security practices
                    </Text>
                  </Box>
                  <Icon as={FiExternalLink} color="brand.500" />
                </HStack>
              </CardBody>
            </Card>

            <Card variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="sm" mb={1}>
                      Terms of Service
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      Read our terms and conditions
                    </Text>
                  </Box>
                  <Icon as={FiExternalLink} color="brand.500" />
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Business Hours */}
        <Card bg="brand.50">
          <CardBody>
            <VStack align="start" spacing={2}>
              <Heading size="sm">Support Hours</Heading>
              <Text fontSize="sm" color="gray.600">
                Monday - Friday: 8:00 AM - 8:00 PM (WAT)
              </Text>
              <Text fontSize="sm" color="gray.600">
                Saturday - Sunday: 10:00 AM - 6:00 PM (WAT)
              </Text>
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                We aim to respond to all inquiries within 24 hours
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};
