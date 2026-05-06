import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../styles/theme";
import {
  RootStackParamList,
  NavbarHeaderScreen,
  AuthUser,
  NavbarHeaderItem,
} from "../types";
import { useAuth } from "../context/AuthContext";
import { useTrackingNotifications } from "../context/TrackingNotificationContext";
import { getUserNotifications } from "../services/notificationService";

const FOUNDER_BADGE_URL = "https://res.cloudinary.com/dndpdkr7o/image/upload/q_auto/f_auto/v1775597474/WhatsApp_Image_2026-04-07_at_23.28.21_gzsmap.jpg";

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
  const [windowWidth, setWindowWidth] = useState(Dimensions.get("window").width);
  const [isMobile, setIsMobile] = useState(Dimensions.get("window").width < 1116);
  const bellAnim = useRef(new Animated.Value(1)).current;
  const totalNotifications = (unreadCount || 0) + (activityUnreadCount || 0);

  // Función para obtener tamaño del logo/insignia según el ancho de ventana (escritorio)
  const getLogoSize = () => {
    if (windowWidth < 480) return { width: 70, height: 22 };
    if (windowWidth < 768) return { width: 85, height: 27 };
    if (windowWidth < 1024) return { width: 100, height: 32 };
    return { width: 120, height: 38 };
  };

  // Tamaño para móvil (íconos cuadrados)
  const getMobileLogoSize = () => {
    if (windowWidth < 480) return { width: 45, height: 45 };
    if (windowWidth < 768) return { width: 40, height: 40 };
    return { width: 45, height: 45 };
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
      setIsMobile(window.width < 1116);
    });
    return () => subscription?.remove();
  }, []);

  // Cerrar dropdown cuando se hace click fuera (solo web)
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".user-menu-trigger") && !target.closest(".user-dropdown")) {
          setUserMenuVisible(false);
        }
      };
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
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
          const notifications = await getUserNotifications(user.id, user.token);
          const unread = notifications.filter((n) => !n.read).length;
          setActivityUnreadCount(unread);
        }
      };
      loadActivityNotifications();
    }, [user])
  );

  // Items para usuarios normales
  const userNavItems: NavbarHeaderItem[] = [
    { name: "Artículos", icon: "file-tray-full-outline", screen: "MyArticles", requiresAuth: true },
    { name: "Kits", icon: "cube-outline", screen: "MyKits", requiresAuth: true },
    { name: "Servicios", icon: "construct-outline", screen: "MyServices", requiresAuth: true },
    { name: "Incidencias", icon: "warning-outline", screen: "MyIncidents", requiresAuth: true },
  ];

  // Items para administradores
  const adminNavItems: NavbarHeaderItem[] = [
    { name: "Usuarios", icon: "people-outline", screen: "AdminUsers", requiresAdmin: true },
    { name: "Categorías", icon: "folder-open-outline", screen: "Categories", requiresAdmin: true },
    { name: "Comisión de Plataforma", icon: "cash", screen: "Commission", requiresAdmin: true },
    { name: "Incidencias", icon: "warning-outline", screen: "AdminIncidents", requiresAdmin: true },
    { name: "Kits Predeterminados", icon: "cube-outline", screen: "DefaultKits", requiresAdmin: true },
  ];


  // Items para repartidores
  const courierNavItems: NavbarHeaderItem[] = [
    { name: "Kits Asignados", icon: "cube-outline", screen: "AssignedKits", requiresAuth: true }
  ];

  // Filtrar items según autenticación y rol
  const getVisibleItems = () => {
    if (!user) return [];
    if (user.role === "ADMIN") {
      return adminNavItems.filter((item) => {
        if (item.requiresAdmin && user.role !== "ADMIN") return false;
        if (item.requiresAuth && !user) return false;
        return true;
      });
    }

    if (user.role === "COURIER") {
    return courierNavItems.filter((item) => {
      if (item.requiresAdmin) return false;
      if (item.requiresAuth && !user) return false;
      return true;
    });
    }

    return userNavItems.filter((item) => {
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

  const handleLogout = () => {
    signOut().catch(console.error);
    setUserMenuVisible(false);
    setMenuVisible(false);
  };

  // Menú de usuario (avatar)
  const getUserMenuSections = (): HeaderMenuSection[] => {
    if (!user) return [];

    if (user.role === "USER") {
      return [
        {
          title: "Mi cuenta",
          items: [
            { name: "Ver Perfil", icon: "person", screen: "Profile" },
            { name: "Mis Valoraciones", icon: "star", screen: "UserRatings", params: { userId: user.id, userName: user.name } },
            { name: "Notificaciones de actividad", icon: "notifications", screen: "ActivityNotifications", badge: activityUnreadCount > 0 ? String(activityUnreadCount) : undefined },
            { name: "Notificaciones de seguimiento", icon: "navigate", screen: "TrackingNotifications", badge: unreadCount > 0 ? String(unreadCount) : undefined },
          ],
        },
        { items: [{ name: "Cerrar Sesión", icon: "log-out", danger: true, onPress: handleLogout }] },
      ];
    }

    if (user.role === "COURIER") {
      return [
        {
          title: "Mi cuenta",
          items: [
            { name: "Ver Perfil", icon: "person", screen: "Profile" },
            { name: "Kits asignados", icon: "cube-outline", screen: "AssignedKits" },
            { name: "Notificaciones de seguimiento", icon: "navigate", screen: "TrackingNotifications" },
          ],
        },
        { items: [{ name: "Cerrar Sesión", icon: "log-out", danger: true, onPress: handleLogout }] },
      ];
    }

    return [
      {
        title: "Mi cuenta",
        items: [
          { name: "Ver Perfil", icon: "person", screen: "Profile" },

          {
            name: "Mis Valoraciones",
            icon: "star",
            screen: "UserRatings",
            params: { userId: user.id, userName: user.name },
          },
          {
            name: "Notificaciones de actividad",
            icon: "notifications",
            screen: "ActivityNotifications",
            badge: activityUnreadCount > 0 ? String(activityUnreadCount) : undefined,
          },
          {
            name: "Notificaciones de seguimiento",
            icon: "navigate",
            screen: "TrackingNotifications",
            badge: unreadCount > 0 ? String(unreadCount) : undefined,
          },

          { name: "Política de Privacidad", icon: "document-text", screen: "EditPolicy" },
        ],
      },
      {
        title: "Próximamente",
        items: [
          { name: "Tipos de Objetos", icon: "cube", disabled: true, badge: "Próximamente" },
          { name: "Rangos de Precios", icon: "pricetags", disabled: true, badge: "Próximamente" },
          { name: "Estadísticas", icon: "bar-chart", disabled: true, badge: "Próximamente" },
        ],
      },
      { items: [{ name: "Cerrar Sesión", icon: "log-out", danger: true, onPress: handleLogout }] },
    ];


  };

  const handleMenuItemPress = (item: HeaderMenuItem) => {
    if (item.disabled) return;
    if (item.onPress) {
      item.onPress();
    } else if (item.screen) {
      if (item.params) navigation.navigate(item.screen as any, item.params as any);
      else navigation.navigate(item.screen as any);
    }
    setUserMenuVisible(false);
    setMenuVisible(false);
  };

  // Versión móvil
  if (isMobile) {
    return (
      <View style={styles.mobileHeader}>
        <View style={styles.mobileLeft}>
          <TouchableOpacity onPress={() => navigateToScreen("Home")}>
            {user?.founderBadge ? (
              <Image
                source={{ uri: FOUNDER_BADGE_URL }}
                style={[styles.mobileBadge, getMobileLogoSize()]}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../assets/logo.png")}
                style={[styles.mobileLogo, getMobileLogoSize()]}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mobileRight}>
          {user && (
            <TouchableOpacity style={styles.bellButton} onPress={() => navigateToScreen("Notifications")}>
              <Animated.View style={{ transform: [{ scale: bellAnim }] }}>
                <Ionicons name="notifications" size={22} color={Colors.primaryHome} />
              </Animated.View>
              {totalNotifications > 0 && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity style={styles.iconButton} onPress={() => navigateToScreen("Wallet")}>
              <Ionicons name="wallet-outline" size={24} color={Colors.primaryHome} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={28} color={Colors.primaryHome} />
          </TouchableOpacity>
        </View>

        {/* Menú móvil modal */}
        <Modal visible={menuVisible} animationType="slide" transparent onRequestClose={() => setMenuVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                {user ? (
                  user.profileImageUrl ? (
                    <Image source={{ uri: user.profileImageUrl }} style={styles.modalAvatar} />
                  ) : (
                    <View style={[styles.modalInitialCircle]}>
                      <Text style={styles.modalInitialText}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )
                ) : (
                  <Image source={require("../../assets/logo.png")} style={styles.modalLogo} />
                )}
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Ionicons name="close" size={28} color={Colors.primaryHome} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {user && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Navegación</Text>
                    {getVisibleItems().map((item) => (
                      <TouchableOpacity key={item.screen} style={styles.modalItem} onPress={() => navigateToScreen(item.screen)}>
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
                        <Ionicons name={item.icon} size={24} color={item.danger ? "#d9534f" : Colors.primaryHome} />
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
      <TouchableOpacity onPress={() => navigateToScreen("Home")} style={styles.logoContainer}>
        {user?.founderBadge ? (
          <Image
            source={{ uri: FOUNDER_BADGE_URL }}
            style={[styles.badgeLogo, { width: 44, height: 44 }]}
            resizeMode="cover"   
          />
        ) : (
          <Image
            source={require("../../assets/logo.png")}
            style={[styles.logo, { width: getLogoSize().width, height: getLogoSize().height }]}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      <View style={styles.navItems}>
        {getVisibleItems().map((item) => (
          <TouchableOpacity key={item.screen} style={styles.navItem} onPress={() => navigateToScreen(item.screen)}>
            <Ionicons name={item.icon} size={20} color={Colors.primaryHome} />
            <Text style={styles.navItemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightActions}>
        {user && <Text style={styles.greetingText}>Hola, {user.name.split(" ")[0]}</Text>}
        {user && (
          <TouchableOpacity style={styles.bellButton} onPress={() => navigateToScreen("Notifications")}>
            <Animated.View style={{ transform: [{ scale: bellAnim }] }}>
              <Ionicons name="notifications" size={22} color={Colors.primaryHome} />
            </Animated.View>
            {totalNotifications > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        )}
        {user && (
          <TouchableOpacity style={styles.userMenuTrigger} onPress={() => setUserMenuVisible(!userMenuVisible)}>
            {user.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="cover" />
            ) : (
              <View style={[styles.userInitialCircle, { backgroundColor: Colors.primaryHome }]}>
                <Text style={styles.userInitial}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
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
                    <Ionicons name={item.icon} size={18} color={item.danger ? "#d9534f" : Colors.primaryHome} />
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

const baseHeaderStyle = {
  backgroundColor: "#fff",
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
};

const styles = StyleSheet.create({
  header: {
    ...baseHeaderStyle,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 10,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#ff3b30",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: {
  },
  mobileLogo: {},
  navItems: { flexDirection: "row", alignItems: "center", gap: 18 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  navItemText: { fontSize: 14, color: Colors.primaryHome, fontWeight: "600" },
  rightActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  greetingText: { fontSize: 16, fontWeight: "700", color: Colors.primaryHome },
  bellButton: { position: "relative", padding: 6 },
  userMenuTrigger: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  userInitialCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  userInitial: { color: "#fff", fontWeight: "800", fontSize: 16 },
  userDropdown: {
    position: "absolute",
    top: 54,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 220,
    zIndex: 50,
  },
  dropdownSection: { marginBottom: 8 },
  dropdownTitle: { fontSize: 11, fontWeight: "700", color: "#888", marginBottom: 6, textTransform: "uppercase" },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  dropdownItemText: { fontSize: 14, color: Colors.primaryHome },
  dropdownItemDisabled: { opacity: 0.5 },
  dangerText: { color: "#d9534f" },
  badgeChip: { marginLeft: "auto", backgroundColor: "#eee", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10, color: "#777" },
  mobileHeader: { ...baseHeaderStyle, paddingHorizontal: 12, paddingVertical: 12 },
  mobileLeft: { flexDirection: "row", alignItems: "center" },
  mobileRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuButton: { padding: 4 },
  iconButton: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalLogo: { width: 50, height: 50 },
  modalAvatar: { width: 50, height: 50, borderRadius: 25 },
  modalInitialCircle: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  modalInitialText: { color: "#fff", fontWeight: "800", fontSize: 22 },
  modalScroll: { marginBottom: 12 },
  modalSection: { marginBottom: 18 },
  modalSectionTitle: { fontSize: 12, fontWeight: "700", color: "#888", marginBottom: 8, textTransform: "uppercase" },
  modalItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  modalItemText: { fontSize: 14, color: Colors.primaryHome, fontWeight: "600" },
  modalItemDisabled: { opacity: 0.5 },
  mobileBadge: {},
  badgeLogo: {},
});

export default HeaderNavbar;