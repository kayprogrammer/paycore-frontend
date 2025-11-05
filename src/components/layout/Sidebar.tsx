import { Box, VStack, Text, Icon, Flex, Avatar, Divider } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiCreditCard,
  FiDollarSign,
  FiShoppingCart,
  FiFileText,
  FiTrendingUp,
  FiPieChart,
  FiHelpCircle,
  FiSettings,
} from 'react-icons/fi';
import { useAppSelector } from '@/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  { label: 'Wallets', icon: FiCreditCard, path: '/wallets' },
  { label: 'Cards', icon: FiCreditCard, path: '/cards' },
  { label: 'Transactions', icon: FiDollarSign, path: '/transactions' },
  { label: 'Bills', icon: FiShoppingCart, path: '/bills' },
  { label: 'Payments', icon: FiFileText, path: '/payments' },
  { label: 'Loans', icon: FiTrendingUp, path: '/loans' },
  { label: 'Investments', icon: FiPieChart, path: '/investments' },
  { label: 'Support', icon: FiHelpCircle, path: '/support' },
  { label: 'Settings', icon: FiSettings, path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      left="0"
      top="0"
      h="100vh"
      w="260px"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      py={6}
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch" h="full">
        {/* Logo */}
        <Box px={6}>
          <Text fontSize="2xl" fontWeight="bold" color="brand.500">
            PayCore
          </Text>
        </Box>

        <Divider />

        {/* Navigation */}
        <VStack spacing={1} px={3} flex={1}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ width: '100%' }}>
                <Flex
                  align="center"
                  px={4}
                  py={3}
                  borderRadius="lg"
                  cursor="pointer"
                  bg={active ? 'brand.50' : 'transparent'}
                  color={active ? 'brand.600' : 'gray.600'}
                  fontWeight={active ? '600' : '400'}
                  _hover={{
                    bg: active ? 'brand.50' : 'gray.50',
                    color: active ? 'brand.600' : 'gray.900',
                  }}
                  transition="all 0.2s"
                >
                  <Icon as={item.icon} boxSize={5} mr={3} />
                  <Text fontSize="sm">{item.label}</Text>
                </Flex>
              </Link>
            );
          })}
        </VStack>

        <Divider />

        {/* User Profile */}
        <Box px={6}>
          <Link to="/profile">
            <Flex align="center" cursor="pointer" _hover={{ opacity: 0.8 }}>
              <Avatar
                size="sm"
                name={`${user?.first_name} ${user?.last_name}`}
                src={user?.avatar || undefined}
                bg="brand.500"
                color="white"
                fontWeight="bold"
                mr={3}
              />
              <Box>
                <Text fontSize="sm" fontWeight="600">
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {user?.email}
                </Text>
              </Box>
            </Flex>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
};
