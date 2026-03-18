import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import HeaderNavbar from './HeaderNavbar';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Header siempre visible */}
      <HeaderNavbar user={user} />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Navbar inferior flotante */}
      {user && <Navbar userRole={user.role} />}
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