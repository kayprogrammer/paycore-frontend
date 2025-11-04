import { Box } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      <Header />
      <Box ml="260px" pt="70px">
        <Box p={8}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
