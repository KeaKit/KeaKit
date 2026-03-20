// src/components/HeaderNavbar.tsx
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

interface HeaderMenuItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: keyof RootStackParamList;
  params?: any;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
}

interface HeaderMenuSection {
  title?: string;
  items: HeaderMenuItem[];
}

const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ user }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  // Cerrar dropdown cuando se hace click fuera (solo web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu-trigger') && !target.closest('.user-dropdown')) {
          setUserMenuVisible(false);
        }
      };
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, []);

  // Items para usuarios normales
  const userNavItems: NavbarHeaderItem[] = [
    { name: 'Artículos', icon: 'file-tray-full-outline', screen: 'MyArticles', requiresAuth: true },
    { name: 'Kits', icon: 'cube-outline', screen: 'MyKits', requiresAuth: true },
    { name: 'Servicios', icon: 'construct-outline', screen: 'MyServices', requiresAuth: true },
    { name: 'Incidencias', icon: 'warning-outline', screen: 'MyIncidents', requiresAuth: true },
  ];

  // Items para administradores
  const adminNavItems: NavbarHeaderItem[] = [
    { name: 'Usuarios', icon: 'people-outline', screen: 'AdminUsers', requiresAdmin: true },
    { name: 'Categorías', icon: 'folder-open-outline', screen: 'Categories', requiresAdmin: true },
    { name: 'Comisión de Plataforma', icon: 'cash', screen: 'Commission', requiresAdmin: true },
    { name: 'Incidencias', icon: 'warning-outline', screen: 'MyIncidents', requiresAdmin: true },
    { name: 'Kits Predeterminados', icon: 'cube-outline', screen: 'DefaultKits', requiresAdmin: true },
  ];

  // Filtrar items según autenticación y rol
  const getVisibleItems = () => {
    if (!user) return [];
    
    if (user.role === 'ADMIN') {
      return adminNavItems.filter(item => {
        if (item.requiresAdmin && user.role !== 'ADMIN') return false;
        if (item.requiresAuth && !user) return false;
        return true;
      });
    }
    
    // Usuario normal
    return userNavItems.filter(item => {
      if (item.requiresAdmin) return false;
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
    setMenuVisible(false);
  };

  // Opciones del menú de usuario (desplegable del avatar) - SIN DUPLICAR LOS ITEMS DEL HEADER
  const getUserMenuSections = (): HeaderMenuSection[] => {
    if (!user) return [];

    // Para usuarios normales (USER)
    if (user.role === 'USER') {
      return [
        {
          title: 'Mi cuenta',
          items: [
            { name: 'Ver Perfil', icon: 'person', screen: 'Profile' },
            { name: 'Mis Valoraciones', icon: 'star', screen: 'UserRatings', 
              params: { userId: user.id, userName: user.name } },
          ]
        },
        {
          items: [
            { name: 'Cerrar Sesión', icon: 'log-out', danger: true, onPress: handleLogout }
          ]
        }
      ];
    }

    // Para administradores (ADMIN) - SIN los items que ya están en el header
    return [
      {
        title: 'Mi cuenta',
        items: [
          { name: 'Ver Perfil', icon: 'person', screen: 'Profile' },
          { name: 'Mis Valoraciones', icon: 'star', screen: 'UserRatings', 
            params: { userId: user.id, userName: user.name } },
        ]
      },
      {
        title: 'Próximamente',
        items: [
          { name: 'Tipos de Objetos', icon: 'cube', disabled: true, badge: 'Próximamente' },
          { name: 'Rangos de Precios', icon: 'pricetags', disabled: true, badge: 'Próximamente' },
          { name: 'Estadísticas', icon: 'bar-chart', disabled: true, badge: 'Próximamente' },
        ]
      },
      {
        items: [
          { name: 'Cerrar Sesión', icon: 'log-out', danger: true, onPress: handleLogout }
        ]
      }
    ];
  };

  const handleMenuItemPress = (item: HeaderMenuItem) => {
    if (item.disabled) return;
    
    if (item.onPress) {
      item.onPress();
    } else if (item.screen) {
      if (item.params) {
        navigation.navigate(item.screen as any, item.params as any);
      } else {
        navigation.navigate(item.screen as any);
      }
    }
    setUserMenuVisible(false);
    setMenuVisible(false);
  };

  // Versión móvil con menú recogido
  if (isMobile) {
    return (
      <View style={styles.mobileHeader}>
        <View style={styles.mobileLeft}>
          <TouchableOpacity onPress={() => navigateToScreen('Home')}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

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
                {/* MÓVIL: Items de navegación para TODOS los usuarios autenticados */}
                {user && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Navegación</Text>
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
                  </View>
                )}

                {!user ? (
                  // Opciones para no autenticado
                  <View style={styles.modalSection}>
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('Login')}
                    >
                      <Ionicons name="log-in-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => navigateToScreen('Register')}
                    >
                      <Ionicons name="person-add-outline" size={24} color={Colors.primaryHome} />
                      <Text style={styles.modalItemText}>Registrarse</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Opciones de perfil y gestión (desplegable del avatar)
                  getUserMenuSections().map((section, idx) => (
                    <View key={idx} style={styles.modalSection}>
                      {section.title && (
                        <Text style={styles.modalSectionTitle}>{section.title}</Text>
                      )}
                      {section.items.map((item, itemIdx) => (
                        <TouchableOpacity
                          key={itemIdx}
                          style={[
                            styles.modalItem,
                            item.danger && styles.modalItemDanger,
                            item.disabled && styles.modalItemDisabled
                          ]}
                          onPress={() => handleMenuItemPress(item)}
                          disabled={item.disabled}
                        >
                          <Ionicons 
                            name={item.icon} 
                            size={24} 
                            color={
                              item.danger ? '#d9534f' : 
                              item.disabled ? Colors.textLight : 
                              Colors.primaryHome
                            } 
                          />
                          <Text style={[
                            styles.modalItemText,
                            item.danger && styles.modalItemTextDanger,
                            item.disabled && styles.modalItemTextDisabled
                          ]}>
                            {item.name}
                          </Text>
                          {item.badge && (
                            <View style={styles.modalBadge}>
                              <Text style={styles.modalBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
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
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigateToScreen('Home')}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

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
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {getUserMenuSections().map((section, idx) => (
                    <View key={idx}>
                      {section.title && (
                        <Text style={styles.dropdownSectionTitle}>{section.title}</Text>
                      )}
                      {section.items.map((item, itemIdx) => (
                        <TouchableOpacity
                          key={itemIdx}
                          style={[
                            styles.dropdownItem,
                            item.danger && styles.dropdownItemDanger,
                            item.disabled && styles.dropdownItemDisabled
                          ]}
                          onPress={() => handleMenuItemPress(item)}
                          disabled={item.disabled}
                        >
                          <Ionicons 
                            name={item.icon} 
                            size={18} 
                            color={
                              item.danger ? '#d9534f' : 
                              item.disabled ? Colors.textLight : 
                              Colors.primaryHome
                            } 
                          />
                          <Text style={[
                            styles.dropdownText,
                            item.danger && styles.dropdownTextDanger,
                            item.disabled && styles.dropdownTextDisabled
                          ]}>
                            {item.name}
                          </Text>
                          {item.badge && (
                            <View style={styles.dropdownBadge}>
                              <Text style={styles.dropdownBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                      {idx < getUserMenuSections().length - 1 && (
                        <View style={styles.dropdownDivider} />
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigateToScreen('Login')}
            >
              <Text style={styles.loginText}>Iniciar Sesión</Text>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 35,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    justifyContent: 'center',
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
  userMenuTrigger: {},
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
    minWidth: 240,
    maxHeight: 400,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 380,
  },
  dropdownSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryHome,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  dropdownItemDanger: {
    opacity: 0.8,
  },
  dropdownItemDisabled: {
    opacity: 0.55,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.primaryHome,
    flex: 1,
  },
  dropdownTextDanger: {
    color: '#d9534f',
  },
  dropdownTextDisabled: {
    color: Colors.textSecondary,
  },
  dropdownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
  },
  dropdownBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
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
  mobileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryHome,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemDanger: {
    borderBottomWidth: 0,
  },
  modalItemDisabled: {
    opacity: 0.55,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.primaryHome,
    fontWeight: '500',
    flex: 1,
  },
  modalItemTextDanger: {
    color: '#d9534f',
  },
  modalItemTextDisabled: {
    color: Colors.textSecondary,
  },
  modalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    backgroundColor: '#eeeeee',
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
});

export default HeaderNavbar;