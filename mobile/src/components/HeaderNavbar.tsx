import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/theme';
import { RootStackParamList, NavbarHeaderScreen, AuthUser, NavbarHeaderItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTrackingNotifications } from '../context/TrackingNotificationContext';
import { getUserNotifications } from '../services/notificationService';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const getLogoSize = () => {
  if (width < 480) {
    // Móviles pequeños
    return { width: 70, height: 22 };
  } else if (width < 768) {
    // Móviles medianos y grandes
    return { width: 85, height: 27 };
  } else if (width < 1024) {
    // Tablets
    return { width: 100, height: 32 };
  } else {
    // Desktop
    return { width: 120, height: 38 };
  }
};

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
  const { unreadCount } = useTrackingNotifications();

  const [menuVisible, setMenuVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activityUnreadCount, setActivityUnreadCount] = useState(0);
  const [screenWidth, setScreenWidth] = useState(width);
  const bellAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

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

  // Campana temporal (4s)
  useEffect(() => {
    if (unreadCount > 0) {
      setShowBadge(true);
      const t = setTimeout(() => setShowBadge(false), 4000);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  // Animación campana
  useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [unreadCount]);

  // Cargar notificaciones de actividad sin leer
  useFocusEffect(
    useCallback(() => {
      const loadActivityNotifications = async () => {
        if (user?.id && user?.token) {
          try {
            const notifications = await getUserNotifications(user.id, user.token);
            const unreadCount = notifications.filter(n => !n.read).length;
            setActivityUnreadCount(unreadCount);
          } catch (err) {
            console.error('Error loading activity notifications:', err);
          }
        }
      };

      loadActivityNotifications();
    }, [user])
  );

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
    { name: 'Incidencias', icon: 'warning-outline', screen: 'AdminIncidents', requiresAdmin: true },
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

  // Menú de usuario (avatar)
  const getUserMenuSections = (): HeaderMenuSection[] => {
    if (!user) return [];

    if (user.role === 'USER') {
      return [
        {
          title: 'Mi cuenta',
          items: [
            { name: 'Ver Perfil', icon: 'person', screen: 'Profile' },
            { name: 'Mis Valoraciones', icon: 'star', screen: 'UserRatings', params: { userId: user.id, userName: user.name } },
            { name: 'Notificaciones de actividad', icon: 'notifications', screen: 'ActivityNotifications', badge: activityUnreadCount > 0 ? String(activityUnreadCount) : undefined },
            { name: 'Notificaciones de seguimiento', icon: 'navigate', screen: 'TrackingNotifications', badge: unreadCount > 0 ? String(unreadCount) : undefined },
          ]
        },
        {
          items: [
            { name: 'Cerrar Sesión', icon: 'log-out', danger: true, onPress: handleLogout }
          ]
        }
      ];
    }

    if (user.role === 'COURIER') {
      return [
        {
          title: 'Mi cuenta',
          items: [
            { name: 'Ver Perfil', icon: 'person', screen: 'Profile' },
            { name: 'Kits asignados', icon: 'cube-outline', screen: 'AssignedKits' },
            { name: 'Notificaciones de seguimiento', icon: 'navigate', screen: 'TrackingNotifications' },
          ]
        },
        {
          items: [
            { name: 'Cerrar Sesión', icon: 'log-out', danger: true, onPress: handleLogout }
          ]
        }
      ];
    }


    return [
      {
        title: 'Mi cuenta',
        items: [
          { name: 'Ver Perfil', icon: 'person', screen: 'Profile' },
          { name: 'Mis Valoraciones', icon: 'star', screen: 'UserRatings', params: { userId: user.id, userName: user.name } },
          { name: 'Notificaciones de actividad', icon: 'notifications', screen: 'ActivityNotifications', badge: activityUnreadCount > 0 ? String(activityUnreadCount) : undefined },
          { name: 'Notificaciones de seguimiento', icon: 'navigate', screen: 'TrackingNotifications', badge: unreadCount > 0 ? String(unreadCount) : undefined },
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
              style={styles.mobileLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mobileRight}>
          {showBadge && (
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => navigateToScreen('TrackingNotifications')}
            >
              <Animated.View style={{ transform: [{ scale: bellAnim }] }}>
                <Ionicons name="notifications" size={22} color={Colors.primaryHome} />
              </Animated.View>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

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

                {getUserMenuSections().map((section, index) => (
                  <View key={index} style={styles.modalSection}>
                    {section.title && <Text style={styles.modalSectionTitle}>{section.title}</Text>}
                    {section.items.map((item, idx) => (
                      <TouchableOpacity
                        key={`${item.name}-${idx}`}
                        style={[styles.modalItem, item.disabled && styles.modalItemDisabled]}
                        onPress={() => handleMenuItemPress(item)}
                      >
                        <Ionicons name={item.icon} size={24} color={item.danger ? '#d9534f' : Colors.primaryHome} />
                        <Text style={[styles.modalItemText, item.danger && styles.dangerText]}>{item.name}</Text>
                        {item.badge && <Text style={styles.badgeChip}>{item.badge}</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Versión desktop/tablet
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigateToScreen('Home')} style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
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

      <View style={styles.rightActions}>
        {user && (
          <Text style={styles.greetingText}>
            Hola, {user.name.split(' ')[0]}
          </Text>
        )}

        {showBadge && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigateToScreen('TrackingNotifications')}
          >
            <Animated.View style={{ transform: [{ scale: bellAnim }] }}>
              <Ionicons name="notifications" size={22} color={Colors.primaryHome} />
            </Animated.View>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {user && (
          <TouchableOpacity
            style={[styles.userMenuTrigger, { backgroundColor: Colors.primaryHome }]}
            onPress={() => setUserMenuVisible(!userMenuVisible)}
          >
            {user.profilePhotoUrl ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={styles.userAvatarImage}
              />
            ) : (
              <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Dropdown usuario */}
        {userMenuVisible && (
          <View style={styles.userDropdown}>
            {getUserMenuSections().map((section, index) => (
              <View key={index} style={styles.dropdownSection}>
                {section.title && <Text style={styles.dropdownTitle}>{section.title}</Text>}
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.name}-${idx}`}
                    style={[styles.dropdownItem, item.disabled && styles.dropdownItemDisabled]}
                    onPress={() => handleMenuItemPress(item)}
                  >
                    <Ionicons name={item.icon} size={18} color={item.danger ? '#d9534f' : Colors.primaryHome} />
                    <Text style={[styles.dropdownItemText, item.danger && styles.dangerText]}>{item.name}</Text>
                    {item.badge && <Text style={styles.badgeChip}>{item.badge}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: getLogoSize().width,
    height: getLogoSize().height,
    maxWidth: '500%',
  },
  mobileLogo: {
    width: 40,
    height: 40,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navItemText: {
    fontSize: 14,
    color: Colors.primaryHome,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryHome,
  },
  bellButton: {
    position: "relative",
    padding: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff3b30",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  userMenuTrigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userInitial: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  userDropdown: {
    position: 'absolute',
    top: 54,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 220,
    zIndex: 50,
  },
  dropdownSection: {
    marginBottom: 8,
  },
  dropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.primaryHome,
  },
  dropdownItemDisabled: {
    opacity: 0.5,
  },
  dangerText: {
    color: '#d9534f',
  },
  badgeChip: {
    marginLeft: 'auto',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    color: '#777',
  },

  // Mobile
  mobileHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    padding: 4,
  },
  iconButton: {
    padding: 4,
  },

  // Modal móvil
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalLogo: {
    width: 50,
    height: 50,
  },
  modalScroll: {
    marginBottom: 12,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 14,
    color: Colors.primaryHome,
    fontWeight: '600',
  },
  modalItemDisabled: {
    opacity: 0.5,
  },
});

export default HeaderNavbar;
