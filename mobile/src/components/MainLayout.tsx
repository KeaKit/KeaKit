// MainLayout.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import HeaderNavbar, { navbarBreakpoint } from './HeaderNavbar';
import Navbar from './Navbar';
import { RgpdModal } from './RgpdModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < navbarBreakpoint);
    };

    checkIsMobile();
    const subscription = Dimensions.addEventListener('change', checkIsMobile);
    return () => subscription?.remove();
  }, []);

  return (
    <View style={styles.container}>
      <HeaderNavbar user={user} />
      <View style={styles.content}>
        {children}
      </View>
      {user && isMobile && <Navbar userRole={user.role} />}
      <RgpdModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;