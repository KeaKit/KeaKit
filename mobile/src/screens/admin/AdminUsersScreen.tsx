import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import {getAdminUsers, deleteUser } from '../../services/adminService';
import { UserResponse, RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { Helmet } from 'react-helmet-async'; 

type AdminUsersNav = NativeStackNavigationProp<RootStackParamList, 'AdminUsers'>;

const AdminUsersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<AdminUsersNav>();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'ADMIN') {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#d9534f" />
          <Text style={styles.errorText}>
            No tienes acceso a este contenido
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  useFocusEffect(
    useCallback(() => {
      const loadUsers = async () => {
        if (!user) {
          setError('Debes iniciar sesión como administrador');
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          console.log('[AdminUsersScreen] Cargando usuarios...');
          const data = await getAdminUsers(user.token);
          console.log('[AdminUsersScreen] Usuarios cargados:', data);
          setUsers(data);
        } catch (err) {
          console.error('[AdminUsersScreen] Error cargando usuarios:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };

      loadUsers();
    }, [user])
  );

  const handleDelete = async (id: number) => {
    if (!user) return;
    try {
      setLoading(true);
      console.log(`[AdminUsersScreen] Eliminando usuario ${id}...`);
      await deleteUser(id, user.token);
      setUsers(users.filter(u => u.id !== id));
      console.log(`[AdminUsersScreen] Usuario ${id} eliminado`);
    } catch (err) {
      console.error('[AdminUsersScreen] Error eliminando usuario:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

 const renderUser = ({ item }: { item: UserResponse }) => (
    <View style={styles.userCard}>
      <View>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AdminUserForm' as any, { user: item })}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Gestión de Usuarios | KeaKit</title>
        <meta name="description" content="Administración de usuarios de la plataforma KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('AdminUserForm' as any)}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Crear usuario</Text>
        </TouchableOpacity>
      </View>

      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios</Text>
        <View style={styles.headerRight} />
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay usuarios registrados</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  createButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminUsersScreen;