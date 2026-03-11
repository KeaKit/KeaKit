import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { 
  Package, 
  UserCircle, 
  PlusCircle, 
  Box, 
  User, 
  Star, 
  Users, 
  LayoutGrid, 
  AlertCircle, 
  LogOut, 
  LogIn, 
  UserPlus 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles, componentStyles } from '../../styles';
import { getWalletByUserId } from '../../services/walletService';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<HomeNav>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id && user?.token) {
        setLoadingBalance(true);
        try {
          const wallet = await getWalletByUserId(user.id, user.token);
          setAvailableBalance(wallet.availableBalance);
        } catch (error) {
          console.error('Error al cargar el saldo:', error);
          setAvailableBalance(null);
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [user?.id, user?.token]);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCreateKit = () => {
    navigation.navigate('CreateKit');
  };

  const handleRentItems = () => {
    navigation.navigate('UploadArticle');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <View style={styles.headerLeft} />

        <View style={commonStyles.logoContainer}>
          <View style={commonStyles.logoBox}>
            <Package size={32} color={Colors.brandIcon} />
          </View>
        </View>

        <TouchableOpacity
          style={componentStyles.iconButton}
          onPress={() => setShowProfileMenu(true)}
        >
          <UserCircle
            size={32}
            color={Colors.primary}
            strokeWidth={user ? 2.5 : 1.5}
          />
        </TouchableOpacity>
      </View>

      <View style={commonStyles.screenPadding}>
        <View style={commonStyles.welcomeSection}>
          <Text style={commonStyles.welcomeTitle}>
            {user ? `¡Hola de nuevo ${user.name}!` : '¡Bienvenido a KeaKit!'}
          </Text>
          <Text style={commonStyles.welcomeSubtitle}>
            {user
              ? 'Gestiona tus kits y alquileres'
              : 'Crea kits y alquila objetos fácilmente'}
          </Text>
          
          {user && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Saldo disponible:</Text>
              {loadingBalance ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.balanceAmount}>
                  {availableBalance !== null ? `${availableBalance.toFixed(2)}€` : 'No disponible'}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={commonStyles.gapLg}>
          <TouchableOpacity
            style={componentStyles.actionButton}
            onPress={handleCreateKit}
            activeOpacity={0.8}
          >
            <View style={componentStyles.actionIconContainer}>
              <PlusCircle size={48} color={Colors.textWhite} />
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
              <Box size={48} color={Colors.textWhite} />
            </View>
            <Text style={componentStyles.actionButtonText}>Alquilar Objetos</Text>
            <Text style={componentStyles.actionButtonSubtext}>
              Pon tus productos en alquiler
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
                  <UserCircle size={48} color={Colors.primary} />
                  <Text style={componentStyles.menuUserName}>{user.name}</Text>
                  <Text style={componentStyles.menuUserEmail}>{user.email}</Text>
                </View>

                <View style={componentStyles.modalDivider} />

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <User size={24} color={Colors.primary} />
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
                  <Star size={24} color={Colors.warning} />
                  <Text style={componentStyles.menuItemText}>Mis Valoraciones</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('MyArticles');
                  }}
                >
                  <Box size={24} color={Colors.primary} />
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
                    <Users size={24} color={Colors.primary} />
                    <Text style={componentStyles.menuItemText}>
                      Gestión de usuarios
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('MyKits');
                  }}
                >
                  <Package size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Mis Kits</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Categories');
                  }}
                >
                  <LayoutGrid size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Categorías</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('MyIncidents');
                  }}
                >
                  <AlertCircle size={24} color={Colors.info} />
                  <Text style={componentStyles.menuItemText}>Mis Incidencias</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={handleLogout}
                >
                  <LogOut size={24} color={Colors.error} />
                  <Text style={[componentStyles.menuItemText, componentStyles.menuItemDanger]}>
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={componentStyles.modalHeader}>
                  <UserCircle size={48} color={Colors.primary} />
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
                  <LogIn size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    navigation.navigate('Register');
                  }}
                >
                  <UserPlus size={24} color={Colors.primary} />
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default HomeScreen;