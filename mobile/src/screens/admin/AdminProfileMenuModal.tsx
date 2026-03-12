import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, componentStyles } from '../../styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AdminProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const AdminProfileMenuModal: React.FC<AdminProfileMenuModalProps> = ({ visible, onClose }) => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();

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
      <Pressable style={componentStyles.modalOverlay} onPress={onClose}>
        <View style={componentStyles.profileMenu}>
          {user ? (
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

              {/* ── Header usuario ────────────────────────────────────── */}
              <View style={componentStyles.modalHeader}>
                <Ionicons name="person-circle" size={60} color={Colors.primary} />
                <Text style={componentStyles.menuUserName}>{user.name}</Text>
                <Text style={componentStyles.menuUserEmail}>{user.email}</Text>
                <View style={adminStyles.roleBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={Colors.primaryHome} />
                  <Text style={adminStyles.roleText}>Administrador</Text>
                </View>
              </View>

              <View style={componentStyles.modalDivider} />

              {/* ── Mi cuenta ─────────────────────────────────────────── */}
              <View style={adminStyles.sectionHeader}>
                <Text style={adminStyles.sectionLabel}>Mi cuenta</Text>
              </View>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('Profile')}
              >
                <Ionicons name="person" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Ver Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('UserRatings', { userId: user.id, userName: user.name })}
              >
                <Ionicons name="star" size={24} color={Colors.warning} />
                <Text style={componentStyles.menuItemText}>Mis Valoraciones</Text>
              </TouchableOpacity>

              <View style={componentStyles.modalDivider} />

              {/* ── Gestión de la plataforma ───────────────────────────── */}
              <View style={adminStyles.sectionHeader}>
                <Text style={adminStyles.sectionLabel}>Gestión de la plataforma</Text>
              </View>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('AdminUsers')}
              >
                <Ionicons name="people" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Gestión de Usuarios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('Categories')}
              >
                <Ionicons name="folder-open" size={24} color={Colors.primary} />
                <Text style={componentStyles.menuItemText}>Categorías</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={() => navigateTo('MyIncidents')}
              >
                <Ionicons name="warning" size={24} color={Colors.warning} />
                <Text style={componentStyles.menuItemText}>Gestión de Incidencias</Text>
              </TouchableOpacity>

              <View style={[componentStyles.menuItem, adminStyles.menuItemDisabled]}>
                <Ionicons name="cube" size={24} color={Colors.textLight} />
                <Text style={[componentStyles.menuItemText, adminStyles.menuTextDisabled]}>
                  Tipos de Objetos
                </Text>
                <View style={adminStyles.comingSoonBadge}>
                  <Text style={adminStyles.comingSoonText}>Próximamente</Text>
                </View>
              </View>

              <View style={[componentStyles.menuItem, adminStyles.menuItemDisabled]}>
                <Ionicons name="pricetags" size={24} color={Colors.textLight} />
                <Text style={[componentStyles.menuItemText, adminStyles.menuTextDisabled]}>
                  Rangos de Precios
                </Text>
                <View style={adminStyles.comingSoonBadge}>
                  <Text style={adminStyles.comingSoonText}>Próximamente</Text>
                </View>
              </View>

              <View style={[componentStyles.menuItem, adminStyles.menuItemDisabled]}>
                <Ionicons name="cash" size={24} color={Colors.textLight} />
                <Text style={[componentStyles.menuItemText, adminStyles.menuTextDisabled]}>
                  Comisión de Plataforma
                </Text>
                <View style={adminStyles.comingSoonBadge}>
                  <Text style={adminStyles.comingSoonText}>Próximamente</Text>
                </View>
              </View>

              <View style={[componentStyles.menuItem, adminStyles.menuItemDisabled]}>
                <Ionicons name="bar-chart" size={24} color={Colors.textLight} />
                <Text style={[componentStyles.menuItemText, adminStyles.menuTextDisabled]}>
                  Estadísticas
                </Text>
                <View style={adminStyles.comingSoonBadge}>
                  <Text style={adminStyles.comingSoonText}>Próximamente</Text>
                </View>
              </View>

              <View style={componentStyles.modalDivider} />

              <TouchableOpacity
                style={componentStyles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={24} color={Colors.error} />
                <Text style={[componentStyles.menuItemText, componentStyles.menuItemDanger]}>
                  Cerrar Sesión
                </Text>
              </TouchableOpacity>

            </ScrollView>
          ) : (
            <>
              <View style={componentStyles.modalHeader}>
                <Ionicons name="person-circle-outline" size={48} color={Colors.primary} />
                <Text style={componentStyles.modalTitle}>Accede a tu cuenta</Text>
              </View>

              <View style={componentStyles.modalDivider} />

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

const adminStyles = StyleSheet.create({
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: `${Colors.primaryHome}18`,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryHome,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryHome,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  menuItemDisabled: {
    opacity: 0.55,
  },
  menuTextDisabled: {
    color: Colors.textSecondary,
    flex: 1,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: '#eeeeee',
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.2,
  },
});

export default AdminProfileMenuModal;