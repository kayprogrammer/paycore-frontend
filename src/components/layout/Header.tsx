import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Text,
  Avatar,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import { FiBell, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout, selectCurrentUser } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/features/auth/services/authApi';
import { useListNotificationsQuery } from '@/features/notifications/services/notificationsApi';

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [logoutMutation] = useLogoutMutation();
  const { data: notificationsData } = useListNotificationsQuery({ limit: 5 });

  const unreadCount = notificationsData?.data?.items?.filter((n) => !n.is_read).length || 0;

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <Box
      as="header"
      pos="fixed"
      top="0"
      left="260px"
      right="0"
      h="70px"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={8}
      zIndex={10}
    >
      <Flex h="full" align="center" justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="600">
            Welcome back, {user?.first_name}!
          </Text>
          <Text fontSize="sm" color="gray.500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Box>

        <HStack spacing={4}>
          {/* Notifications */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={
                <Box position="relative">
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-8px"
                      right="-8px"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Box>
              }
              variant="ghost"
              aria-label="Notifications"
            />
            <MenuList maxH="400px" overflowY="auto">
              <Text px={4} py={2} fontSize="sm" fontWeight="600">
                Notifications
              </Text>
              <MenuDivider />
              {notificationsData?.data?.items && notificationsData.data.items.length > 0 ? (
                notificationsData.data.items.map((notification) => (
                  <MenuItem key={notification.id} py={3}>
                    <Box>
                      <Text fontSize="sm" fontWeight="600">
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={2}>
                        {notification.message}
                      </Text>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem>
                  <Text fontSize="sm" color="gray.500">
                    No notifications
                  </Text>
                </MenuItem>
              )}
              <MenuDivider />
              <MenuItem onClick={() => navigate('/notifications')}>
                <Text fontSize="sm" color="brand.500" fontWeight="600">
                  View All
                </Text>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* User Menu */}
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name={`${user?.first_name} ${user?.last_name}`}
                src={user?.avatar || undefined}
                bg="brand.500"
                color="white"
                fontWeight="bold"
                cursor="pointer"
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                Profile
              </MenuItem>
              <MenuItem icon={<FiSettings />} onClick={() => navigate('/settings')}>
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};
