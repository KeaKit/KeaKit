import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/theme';
import { RootStackParamList, NavbarHeaderScreen, AuthUser, NavbarHeaderItem } from '../types';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

interface HeaderNavbarProps {
  user: AuthUser | null;
}

const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ user }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  // Cerrar dropdown cuando se hace click fuera (solo web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = () => {
        setUserMenuVisible(false);
      };
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, []);

  // Items principales del navbar
  const mainNavItems: NavbarHeaderItem[] = [
    { name: 'Inicio', icon: 'home-outline', screen: 'Home' },
    { name: 'Artículos', icon: 'file-tray-full-outline', screen: 'MyArticles', requiresAuth: true },
    { name: 'Kits', icon: 'cube-outline', screen: 'MyKits', requiresAuth: true },
    { name: 'Servicios', icon: 'construct-outline', screen: 'MyServices', requiresAuth: true },
    { name: 'Incidencias', icon: 'warning-outline', screen: 'MyIncidents', requiresAuth: true },
    { name: 'Wallet', icon: 'wallet-outline', screen: 'Wallet', requiresAuth: true },
  ];

  // Items de administración
  const adminNavItems: NavbarHeaderItem[] = [
    { name: 'Usuarios', icon: 'people-outline', screen: 'AdminUsers', requiresAdmin: true },
    { name: 'Categorías', icon: 'folder-open-outline', screen: 'Categories', requiresAdmin: true },
  ];

  // Filtrar items según autenticación y rol
  const getVisibleItems = () => {
    let items = [...mainNavItems];
    
    if (user?.role === 'ADMIN') {
      items = [...items, ...adminNavItems];
    }
    
    return items.filter(item => {
      if (item.requiresAdmin && user?.role !== 'ADMIN') return false;
      if (item.requiresAuth && !user) return false;
      return true;
    });
  };

  const navigateToScreen = (screen: NavbarHeaderScreen) => {
    navigation.navigate(screen as any);
    setMenuVisible(false);
    setUserMenuVisible(false);
  };

  const handleLogout = async () => {
    await signOut();
    setUserMenuVisible(false);
  };

  // Versión móvil
  if (isMobile) {
    return (
      <View style={styles.mobileHeader}>
        <TouchableOpacity onPress={() => navigateToScreen('Home')}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.mobileRight}>
          {user && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigateToScreen('Wallet')}
            >
              <Ionicons name="wallet-outline" size={24} color={Colors.primaryHome} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu-outline" size={28} color={Colors.primaryHome} />
          </TouchableOpacity>
        </View>

        {/* Menú móvil modal */}
        <Modal
          visible={menuVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Image source={require('../../assets/logo.png')} style={styles.modalLogo} />
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Ionicons name="close" size={28} color={Colors.primaryHome} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {getVisibleItems().map((item) => (
                  <TouchableOpacity
                    key={item.screen}
                    style={styles.modalItem}
                    onPress={() => navigateToScreen(item.screen)}
                  >
                    <Ionicons name={item.icon} size={24} color={Colors.primaryHome} />
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}

                {!user ? (
                  <>
                    <View style={styles.modalDivider} />
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('Login')}
                    >
                      <Ionicons name="log-in-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('Register')}
                    >
                      <Ionicons name="person-add-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Registrarse</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.modalDivider} />
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('Profile')}
                    >
                      <Ionicons name="person-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Mi perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('UserRatings')}
                    >
                      <Ionicons name="star-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Mis valoraciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalItem, styles.modalLogout]}
                      onPress={handleLogout}
                    >
                      <Ionicons name="log-out-outline" size={24} color="#d9534f" />
                      <Text style={[styles.modalItemText, styles.modalLogoutText]}>Cerrar sesión</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Versión desktop
  return (
    <View style={styles.desktopHeader}>
      <TouchableOpacity onPress={() => navigateToScreen('Home')}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.navItems}>
        {getVisibleItems().map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => navigateToScreen(item.screen)}
          >
            <Ionicons name={item.icon} size={20} color={Colors.primaryHome} />
            <Text style={styles.navItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.userSection}>
        {user ? (
          <>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigateToScreen('Wallet')}
            >
              <Ionicons name="wallet-outline" size={22} color={Colors.primaryHome} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.userMenuTrigger}
              onPress={() => setUserMenuVisible(!userMenuVisible)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>

            {userMenuVisible && (
              <View style={styles.userDropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => navigateToScreen('Profile')}
                >
                  <Ionicons name="person-outline" size={18} color={Colors.primaryHome} />
                  <Text style={styles.dropdownText}>Mi perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => navigateToScreen('UserRatings')}
                >
                  <Ionicons name="star-outline" size={18} color={Colors.primaryHome} />
                  <Text style={styles.dropdownText}>Mis valoraciones</Text>
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity 
                  style={[styles.dropdownItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={18} color="#d9534f" />
                  <Text style={[styles.dropdownText, styles.logoutText]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigateToScreen('Login')}
            >
              <Text style={styles.loginText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigateToScreen('Register')}
            >
              <Text style={styles.registerText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop styles
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  logo: {
    width: 120,
    height: 40,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryHome,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  userMenuTrigger: {
    cursor: 'pointer',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryHome,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userDropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 200,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.primaryHome,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  logoutItem: {
    opacity: 0.8,
  },
  logoutText: {
    color: '#d9534f',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryHome,
  },
  loginText: {
    color: Colors.primaryHome,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryHome,
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Mobile styles
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mobileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalLogo: {
    width: 100,
    height: 35,
  },
  modalScroll: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.primaryHome,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  modalLogout: {
    borderBottomWidth: 0,
  },
  modalLogoutText: {
    color: '#d9534f',
  },
});

export default HeaderNavbar;