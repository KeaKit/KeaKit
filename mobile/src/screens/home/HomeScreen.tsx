import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<HomeNav>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCreateKit = () => {
    console.log('Crear kit');
    navigation.navigate('CreateKit');
  };

  const handleRentItems = () => {
    console.log('Poner a alquilar objetos');
    // TODO: Navegar a pantalla de subir artículos
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header - usando estilos comunes */}
      <View style={commonStyles.header}>
        <View style={styles.headerLeft} />

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
            {user ? `¡Hola de nuevo ${user.name}!` : '¡Bienvenido a KeaKit!'}
          </Text>
          <Text style={commonStyles.welcomeSubtitle}>
            {user
              ? 'Gestiona tus kits y alquileres'
              : 'Crea kits y alquila objetos fácilmente'}
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
            style={[componentStyles.actionButton, componentStyles.actionButtonSecondary]}
            onPress={handleRentItems}
            activeOpacity={0.8}
          >
            <View style={componentStyles.actionIconContainer}>
              <Ionicons name="cube-outline" size={48} color={Colors.textWhite} />
            </View>
            <Text style={componentStyles.actionButtonText}>Alquilar Objetos</Text>
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
                  <Ionicons name="person-circle" size={48} color={Colors.primary} />
                  <Text style={componentStyles.menuUserName}>{user.name}</Text>
                  <Text style={componentStyles.menuUserEmail}>{user.email}</Text>
                </View>

                <View style={componentStyles.modalDivider} />

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    // TODO: Implementar pantalla de perfil
                    console.log('Ir a perfil');
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
                      navigation.navigate('UserRatings', {
                        userId: user.id,
                        userName: user.name,
                      });
                    }
                  }}
                >
                  <Ionicons name="star" size={24} color={Colors.warning} />
                  <Text style={componentStyles.menuItemText}>Mis Valoraciones</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('MyArticles');
                  }}
                >
                  <Ionicons name="cube" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Mis Artículos</Text>
                </TouchableOpacity>

                {user?.role === 'ADMIN' && (
                  <TouchableOpacity
                    style={componentStyles.menuItem}
                    onPress={() => {
                      setShowProfileMenu(false);
                      navigation.navigate('AdminUsers');
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
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={24} color={Colors.error} />
                  <Text style={[componentStyles.menuItemText, componentStyles.menuItemDanger]}>
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={componentStyles.modalHeader}>
                  <Ionicons name="person-circle-outline" size={48} color={Colors.primary} />
                  <Text style={componentStyles.modalTitle}>Accede a tu cuenta</Text>
                </View>

                <View style={componentStyles.modalDivider} />

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Login');
                  }}
                >
                  <Ionicons name="log-in" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Register');
                  }}
                >
                  <Ionicons name="person-add" size={24} color={Colors.primary} />
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
  headerLeft: {
    width: 32, // Espaciador para centrar el logo
  },
});

export default HomeScreen;
