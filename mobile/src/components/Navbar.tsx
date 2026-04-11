import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/theme';
import { RootStackParamList, NavbarScreen, UserRole } from '../types';

type NavItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: NavbarScreen;
};

interface NavbarProps {
  userRole: UserRole;
}

const Navbar: React.FC<NavbarProps> = ({ userRole }: NavbarProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Para usuarios normales
  const userNavItems: NavItem[] = [
    { name: 'Artículos', icon: 'file-tray-full-outline', screen: 'MyArticles' },
    { name: 'Servicios', icon: 'construct-outline', screen: 'MyServices' },
    { name: 'Inicio', icon: 'home-outline', screen: 'Home' },
    { name: 'Kits', icon: 'cube-outline', screen: 'MyKits' },
    { name: 'Perfil', icon: 'person-outline', screen: 'Profile' },
  ];

  // Para administradores
  const adminNavItems: NavItem[] = [
    { name: 'Usuarios', icon: 'people-outline', screen: 'AdminUsers' },
    { name: 'Categorías', icon: 'folder-open-outline', screen: 'Categories' },
    { name: 'Inicio', icon: 'home-outline', screen: 'Home' },
    { name: 'Incidencias', icon: 'warning-outline', screen: 'AdminIncidents' },
    { name: 'Perfil', icon: 'person-outline', screen: 'Profile' },
  ];

  const navItems: NavItem[] = userRole === 'ADMIN' ? adminNavItems : userNavItems;

  const navigateToScreen = (screen: NavbarScreen) => {
    navigation.navigate(screen as any);
  };

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.navbar}>
        {navItems.map((item) => (
          <TouchableOpacity 
            key={item.screen} 
            style={styles.navItem}
            onPress={() => navigateToScreen(item.screen)}
          >
            <Ionicons name={item.icon} size={24} color={Colors.primaryHome} />
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingHorizontal: 16,
    pointerEvents: 'box-none',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    maxWidth: 500,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    } as any : {}),
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    color: Colors.primaryHome,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Navbar;