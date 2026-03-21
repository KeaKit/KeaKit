import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, componentStyles } from '../../styles';
import { useTrackingNotifications } from "../../context/TrackingNotificationContext";


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({ visible, onClose }) => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { unreadCount } = useTrackingNotifications();

  const handleLogout = async () => {
    onClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navigateTo = <T extends keyof RootStackParamList>(
  screenName: T,
  params?: RootStackParamList[T]
    ) => {
        onClose();
        if (params !== undefined) {
            (navigation.navigate as any)(screenName, params);
        } else {
            (navigation.navigate as any)(screenName);
        }
    };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={componentStyles.modalOverlay}
        onPress={onClose}
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
                onPress={() => navigateTo('Profile')}
              >
                <Ionicons name="person" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Ver Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('TrackingNotifications')}
              >
                <Ionicons name="notifications" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Notificaciones</Text>
                {unreadCount > 0 ? (
                  <View style={componentStyles.menuBadge}>
                    <Text style={componentStyles.menuBadgeText}>{unreadCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>


              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('UserRatings', {
                  userId: user.id,
                  userName: user.name,
                })}
              >
                <Ionicons name="star" size={24} color={Colors.warning} />
                <Text style={componentStyles.menuItemText}>Mis Valoraciones</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('MyArticles')}
              >
                <Ionicons name="bag" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Mis Artículos</Text>
              </TouchableOpacity>

              {/* --- BOTONES DE ADMIN --- */}
              {user?.role === 'ADMIN' && (
                <> {/* <--- Añade esta etiqueta de apertura */}
                  <TouchableOpacity
                    style={componentStyles.menuItem}
                    onPress={() => navigateTo('AdminUsers')}
                  >
                    <Ionicons name="people" size={24} color={Colors.primary} />
                    <Text style={componentStyles.menuItemText}>Gestión de usuarios</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                      style={componentStyles.menuItem}
                      onPress={() => navigateTo('Categories')}
                  >
                      <Ionicons name="reader" size={24} color={Colors.primary} />
                      <Text style={componentStyles.menuItemText}>Categorías</Text>
                  </TouchableOpacity>
                </>
                )}

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('MyKits')}
              >
                <Ionicons name="cube" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Mis Kits</Text>
              </TouchableOpacity>

              {user?.role === 'COURIER' && (
                <TouchableOpacity
                  style={componentStyles.menuItem}
                  onPress={() => navigateTo('AssignedKits')}
                >
                  <Ionicons name="briefcase-sharp" size={24} color={Colors.primary} />
                  <Text style={componentStyles.menuItemText}>Kits asignados</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('MyServices')}
              >
                <Ionicons name="construct-outline" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Mis Servicios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('MyIncidents')}
              >
                <Ionicons name="alert-circle" size={24} color={Colors.info} />
                <Text style={componentStyles.menuItemText}>Mis Incidencias</Text>
              </TouchableOpacity>

              {/* --- LOGOUT --- */}
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
              {/* --- HEADER USUARIO NO AUTENTICADO --- */}
              <View style={componentStyles.modalHeader}>
                <Ionicons name="person-circle-outline" size={48} color={Colors.primary} />
                <Text style={componentStyles.modalTitle}>Accede a tu cuenta</Text>
              </View>

              <View style={componentStyles.modalDivider} />

              {/* --- BOTONES LOGIN/REGISTRO --- */}
              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('Login')}
              >
                <Ionicons name="log-in" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('Register')}
              >
                <Ionicons name="person-add" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Registrarse</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default ProfileMenuModal;