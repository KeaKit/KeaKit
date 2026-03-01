import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import BASE_URL from "../../config/api";
import { KitResponse, RootStackParamList } from "../../types";
import { Colors, Spacing, commonStyles, componentStyles } from "../../styles";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<HomeNav>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const parseIsoDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    const parsed = new Date(`${dateString}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const hasUrgentDeliveryNotification = (kits: KitResponse[]): boolean => {
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    return kits.some((kit) => {
      const estimatedDate = parseIsoDate(kit.estimatedDeliveryDate);
      if (!estimatedDate) return false;
      return estimatedDate >= today && estimatedDate <= tomorrow;
    });
  };

  useFocusEffect(
    useCallback(() => {
      const loadBadgeState = async () => {
        if (!user?.id) {
          setHasNewNotification(false);
          return;
        }

        try {
          const response = await fetch(
            `${BASE_URL}/api/kits/my-kits/${user.id}`,
          );
          if (!response.ok) {
            setHasNewNotification(false);
            return;
          }

          const kits: KitResponse[] = await response.json();
          setHasNewNotification(hasUrgentDeliveryNotification(kits));
        } catch {
          setHasNewNotification(false);
        }
      };

      loadBadgeState();
    }, [user?.id]),
  );

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleCreateKit = () => {
    console.log("Crear kit");
    navigation.navigate("CreateKit");
  };

  const handleRentItems = () => {
    console.log("Poner a alquilar objetos");
    // TODO: Navegar a pantalla de subir artículos
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header - usando estilos comunes */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={componentStyles.iconButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="mail-outline" size={24} color={Colors.primary} />
          {hasNewNotification ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>1</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Logo Central - usando estilos comunes */}
        <View style={commonStyles.logoContainer}>
          <View style={commonStyles.logoBox}>
            <Ionicons name="cube" size={32} color={Colors.brandIcon} />
          </View>
        </View>

        {/* Botón de Perfil/Usuario */}
        <TouchableOpacity
          style={componentStyles.iconButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <Ionicons
            name={user ? "person-circle" : "person-circle-outline"}
            size={32}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <View style={commonStyles.screenPadding}>
        {/* Mensaje de Bienvenida - usando estilos comunes */}
        <View style={commonStyles.welcomeSection}>
          <Text style={commonStyles.welcomeTitle}>
            {user ? `¡Hola de nuevo ${user.name}!` : "¡Bienvenido a KeaKit!"}
          </Text>
          <Text style={commonStyles.welcomeSubtitle}>
            {user
              ? "Gestiona tus kits y alquileres"
              : "Crea kits y alquila objetos fácilmente"}
          </Text>
        </View>

        {/* Botones Principales - usando estilos de componentes */}
        <View style={commonStyles.gapLg}>
          <TouchableOpacity
            style={componentStyles.actionButton}
            onPress={handleCreateKit}
            activeOpacity={0.8}
          >
            <View style={componentStyles.actionIconContainer}>
              <Ionicons name="add-circle" size={48} color={Colors.textWhite} />
            </View>
            <Text style={componentStyles.actionButtonText}>Crear Kits</Text>
            <Text style={componentStyles.actionButtonSubtext}>
              Agrupa productos relacionados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              componentStyles.actionButton,
              componentStyles.actionButtonSecondary,
            ]}
            onPress={handleRentItems}
            activeOpacity={0.8}
          >
            <View style={componentStyles.actionIconContainer}>
              <Ionicons
                name="cube-outline"
                size={48}
                color={Colors.textWhite}
              />
            </View>
            <Text style={componentStyles.actionButtonText}>
              Alquilar Objetos
            </Text>
            <Text style={componentStyles.actionButtonSubtext}>
              Pon tus productos en alquiler
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de Menú de Perfil - usando estilos de componentes */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable
          style={componentStyles.modalOverlay}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={componentStyles.profileMenu}>
            {user ? (
              <>
                <View style={componentStyles.modalHeader}>
                  <Ionicons
                    name="person-circle"
                    size={48}
                    color={Colors.primary}
                  />
                  <Text style={componentStyles.menuUserName}>{user.name}</Text>
                  <Text style={componentStyles.menuUserEmail}>
                    {user.email}
                  </Text>
                </View>

                <View style={componentStyles.modalDivider} />

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    // TODO: Implementar pantalla de perfil
                    console.log("Ir a perfil");
                  }}
                >
                  <Ionicons name="person" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Ver Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    if (user) {
                      navigation.navigate("UserRatings", {
                        userId: user.id,
                        userName: user.name,
                      });
                    }
                  }}
                >
                  <Ionicons name="star" size={24} color={Colors.warning} />
                  <Text style={componentStyles.menuItemText}>
                    Mis Valoraciones
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("MyArticles");
                  }}
                >
                  <Ionicons name="cube" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>
                    Mis Artículos
                  </Text>
                </TouchableOpacity>

                {user?.role === "ADMIN" && (
                  <TouchableOpacity
                    style={componentStyles.menuItem}
                    onPress={() => {
                      setShowProfileMenu(false);
                      navigation.navigate("AdminUsers");
                    }}
                  >
                    <Ionicons name="people" size={24} color={Colors.primary} />
                    <Text style={componentStyles.menuItemText}>
                      Gestión de usuarios
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("MyKits");
                  }}
                >
                  <Ionicons name="cube" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Mis Kits</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("Categories");
                  }}
                >
                  <Ionicons name="reader" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Categorías</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={24} color={Colors.error} />
                  <Text
                    style={[
                      componentStyles.menuItemText,
                      componentStyles.menuItemDanger,
                    ]}
                  >
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={componentStyles.modalHeader}>
                  <Ionicons
                    name="person-circle-outline"
                    size={48}
                    color={Colors.primary}
                  />
                  <Text style={componentStyles.modalTitle}>
                    Accede a tu cuenta
                  </Text>
                </View>

                <View style={componentStyles.modalDivider} />

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("Login");
                  }}
                >
                  <Ionicons name="log-in" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate("Register");
                  }}
                >
                  <Ionicons
                    name="person-add"
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={componentStyles.menuItemText}>Registrarse</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Estilos locales específicos de esta pantalla (solo lo que no se puede reutilizar)
const styles = StyleSheet.create({
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
});

export default HomeScreen;
