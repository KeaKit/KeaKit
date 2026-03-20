import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import HeaderNavbar from './HeaderNavbar';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para verificar si es móvil/tablet
    const checkIsMobile = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < 768);
    };

    checkIsMobile();

    const subscription = Dimensions.addEventListener('change', checkIsMobile);
    
    return () => subscription?.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header siempre visible en todas las plataformas */}
      <HeaderNavbar user={user} />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Navbar inferior SOLO en móvil/tablet Y si hay usuario */}
      {user && isMobile && <Navbar userRole={user.role} />}
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