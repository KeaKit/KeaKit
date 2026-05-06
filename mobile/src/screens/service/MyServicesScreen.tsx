import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyServices, deleteService, getServiceById } from '../../services/servicesService';
import { RootStackParamList, Service, ServiceStatus } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useNotification } from '../../components/NotificationContext';
import { ConfirmModal } from '../../components/ConfirmModal';

type MyServicesNav = NativeStackNavigationProp<RootStackParamList, 'MyServices'>;
type FilterType = 'ALL' | 'ACTIVE' | 'UNAVAILABLE' | 'DRAFT';

const MyServicesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyServicesNav>();
  const { showNotification } = useNotification();

  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Estados para el modal de confirmación
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadServices = async () => {
        if (!user) {
          setError('Debes iniciar sesión para ver tus servicios');
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          const data = await getMyServices(user.id, user.token);
          setServices(data);
          setFilteredServices(applyFilter(filter, data));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar servicios');
          showNotification('Error al cargar los servicios', 'error');
        } finally {
          setLoading(false);
        }
      };
      loadServices();
    }, [user])
  );

  const applyFilter = (f: FilterType, data: Service[]) => {
    
    const isOccupied = (s: Service) => {
      const rented = s.rentedUnitsNow || 0;
      const total = s.totalUnits || 1; // Salvavidas de TypeScript
      return rented > 0 && rented >= total;
    };

    if (f === 'ACTIVE') {
      return data.filter(s => s.status === 'ACTIVE' && !isOccupied(s));
    }

    if (f === 'UNAVAILABLE') {
      return data.filter(s => isOccupied(s));
    }

    if (f === 'DRAFT') {
      return data.filter(s => s.status === 'DRAFT');
    }

    return data;
  };

  const handleFilter = (f: FilterType) => {
    setFilter(f);
    setFilteredServices(applyFilter(f, services));
  };

  const handleEdit = async (item: Service) => {
    if (!user) return;
    try {
      const full = await getServiceById(item.id, user.token);
      navigation.navigate('EditService', { service: full });
    } catch (err: any) {
      showNotification(err.message || 'No se pudo cargar el servicio', 'error');
    }
  };

  const handleDeletePress = (item: Service) => {
    if (item.status === 'UNAVAILABLE') {
      showNotification(
        'Este servicio está actualmente alquilado. Espera a que finalice el alquiler para eliminarlo.',
        'error'
      );
      return;
    }
    
    // Mostrar modal de confirmación
    setServiceToDelete(item);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !serviceToDelete) return;
    
    setConfirmModalVisible(false);
    setDeletingId(serviceToDelete.id);
    
    try {
      await deleteService(serviceToDelete.id, user.id, user.token);
      const updated = services.filter(s => s.id !== serviceToDelete.id);
      setServices(updated);
      setFilteredServices(applyFilter(filter, updated));
      showNotification('Servicio eliminado correctamente', 'success');
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'No se pudo eliminar el servicio',
        'error'
      );
    } finally {
      setDeletingId(null);
      setServiceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalVisible(false);
    setServiceToDelete(null);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return dateString; }
  };

  const getStatusColor = (item: Service) => {
    const rented = item.rentedUnitsNow || 0;
    const total = item.totalUnits || 1;

    if (rented > 0 && rented >= total) return '#dc3545'; 

    if (rented > 0 && rented < total) return '#ffc107'; 
    
    switch (item.status) {
      case 'ACTIVE': return '#28a745'; // Verde
      case 'DRAFT': return '#6c757d'; // Gris
      case 'UNAVAILABLE': return '#dc3545'; // Rojo (Oculto manualmente)
      default: return '#000000';
    }
  };

  const translateStatus = (item: Service) => {
    const rented = item.rentedUnitsNow || 0;
    const total = item.totalUnits || 1;
    
    if (rented > 0 && rented >= total) {
      return `Ocupado (${rented}/${item.totalUnits})`;
    }

    if (rented > 0 && rented < total) {
      return `Alquilado (${rented}/${item.totalUnits})`;
    }
    
    switch (item.status) {
      case 'ACTIVE': return 'Activo';
      case 'DRAFT': return 'Borrador';
      case 'UNAVAILABLE': return 'Oculto';
      default: return `Error: ${item.status}`;
    }
  };

  const getFilterLabel = (f: FilterType): string => {
    
    const isOccupied = (s: Service) => {
      const rented = s.rentedUnitsNow || 0;
      const total = s.totalUnits || 1;
      return rented > 0 && rented >= total;
    };

    const all = services.length;
    const activeCount = services.filter(s => s.status === 'ACTIVE' && !isOccupied(s)).length;
    const occupiedCount = services.filter(s => isOccupied(s)).length;
    const draftCount = services.filter(s => s.status === 'DRAFT').length;

    switch (f) {
      case 'ALL': return `Todos (${all})`;
      case 'ACTIVE': return `Activos (${activeCount})`;
      case 'UNAVAILABLE': return `Ocupados (${occupiedCount})`;
      case 'DRAFT': return `Borradores (${draftCount})`;
    }
  };

  const renderService = ({ item }: { item: Service }) => {
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.serviceCard}>
        <TouchableOpacity
          style={styles.cardPressable}
          onPress={() => handleEdit(item)}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="construct-outline" size={40} color={Colors.primary} />
          </View>

          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{item.city}</Text>
            </View>
            <View style={styles.priceRow}>
              <Ionicons name="cash-outline" size={16} color={Colors.primary} />
              <Text style={styles.servicePrice}>{`€${item.pricePerMonth.toFixed(2)}/mes`}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
                <Text style={styles.statusText}>{translateStatus(item)}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.dateText}>
                {formatDate(item.availableFrom)} - {formatDate(item.availableUntil)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.editButton}
            onPress={() => handleEdit(item)}
            disabled={isDeleting}
          >
            <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeletePress(item)}
            disabled={isDeleting}
          >
            {isDeleting
              ? <ActivityIndicator size="small" color="#d9534f" />
              : <Ionicons name="trash-outline" size={20} color="#d9534f" />
            }
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
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

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Servicios</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        {(['ALL', 'ACTIVE', 'UNAVAILABLE', 'DRAFT'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => handleFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {getFilterLabel(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'ALL'
              ? 'No tienes servicios publicados'
              : `No tienes servicios ${filter === 'ACTIVE' ? 'activos' : filter === 'UNAVAILABLE' ? 'ocupados' : 'en borrador'}`}
          </Text>
          <Text style={styles.emptySubtext}>Pulsa el botón + para publicar tu primer servicio</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderService}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PromoteService')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Confirmar eliminación"
        message={`¿Seguro que quieres eliminar "${serviceToDelete?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmStyle="destructive"
      />
    </SafeAreaView>
  );
};

// Los estilos se mantienen igual
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
    color: Colors.textPrimaryHome,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressable: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimaryHome,
    marginBottom: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: '#e8f4fd',
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: '#fdecea',
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
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default MyServicesScreen;