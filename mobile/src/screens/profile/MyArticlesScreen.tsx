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
  Image,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyArticles, deleteArticle, getArticleById, getArticleRecord } from '../../services/articleService';
import { RootStackParamList, UserArticle } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useNotification } from '../../components/NotificationContext'; // 👈 Importar notificaciones
import { ConfirmModal } from '../../components/ConfirmModal'; // 👈 Importar modal de confirmación

type MyArticlesNav = NativeStackNavigationProp<RootStackParamList, 'MyArticles'>;
type FilterType = 'ALL' | 'AVAILABLE' | 'RENTED';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyArticlesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyArticlesNav>();
  const { showNotification } = useNotification(); // 👈 Hook de notificaciones

  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Estados para el modal de confirmación
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<UserArticle | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    const article = articles.find(a => a.id === id);

    if (article && (!article.rentals || article.rentals.length === 0)) {
      try {
        const record = await getArticleRecord(id, user!.token);
        
        const updatedArticles = articles.map(a => 
          a.id === id ? { ...a, rentals: record } : a
        );
        
        setArticles(updatedArticles);
        setFilteredArticles(applyFilter(filter, updatedArticles));
      } catch (err) {
        showNotification('Error al cargar el historial', 'error');
      }
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(id);
  };

  useFocusEffect(
    useCallback(() => {
      const loadArticles = async () => {
        if (!user) {
          setError('Debes iniciar sesión para ver tus artículos');
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setError(null);
          const data = await getMyArticles(user.id, user.token);
          setArticles(data);
          setFilteredArticles(applyFilter(filter, data));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar artículos');
          showNotification('Error al cargar los artículos', 'error'); // 👈 Notificación
        } finally {
          setLoading(false);
        }
      };
      loadArticles();
    }, [user])
  );

  const applyFilter = (f: FilterType, data: UserArticle[]) => {
    if (f === 'AVAILABLE') return data.filter(a => a.status === 'AVAILABLE');
    if (f === 'RENTED')    return data.filter(a => a.status === 'RENTED');
    return data;
  };

  const handleFilter = (f: FilterType) => {
    setFilter(f);
    setFilteredArticles(applyFilter(f, articles));
  };

  const handleEdit = async (item: UserArticle) => {
    if (!user) return;
    try {
      const full = await getArticleById(item.id, user.token);
      navigation.navigate('EditArticle', { article: full });
    } catch (err: any) {
      showNotification(err.message || 'No se pudo cargar el artículo', 'error'); // 👈 Notificación
    }
  };

  const handleDeletePress = (item: UserArticle) => {
    if (item.status === 'RENTED') {
      showNotification(
        'Este artículo está actualmente alquilado. Espera a que finalice el alquiler para eliminarlo.',
        'error'
      ); // 👈 Notificación
      return;
    }
    
    // Mostrar modal de confirmación
    setArticleToDelete(item);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !articleToDelete) return;
    
    setConfirmModalVisible(false);
    setDeletingId(articleToDelete.id);
    
    try {
      await deleteArticle(articleToDelete.id, user.id, user.token);
      const updated = articles.filter(a => a.id !== articleToDelete.id);
      setArticles(updated);
      setFilteredArticles(applyFilter(filter, updated));
      showNotification('Artículo eliminado correctamente', 'success'); // 👈 Notificación éxito
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'No se pudo eliminar el artículo',
        'error'
      ); // 👈 Notificación error
    } finally {
      setDeletingId(null);
      setArticleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalVisible(false);
    setArticleToDelete(null);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return dateString; }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#28a745';
      case 'RENTED':    return '#ffc107';
      case 'INACTIVE':  return '#6c757d';
      default:          return '#999';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'RENTED':    return 'Alquilado';
      case 'INACTIVE':  return 'Inactivo';
      default:          return status;
    }
  };

  const getFilterLabel = (f: FilterType): string => {
    switch (f) {
      case 'ALL':       return `Todos (${articles.length})`;
      case 'AVAILABLE': return `Disponibles (${articles.filter(a => a.status === 'AVAILABLE').length})`;
      case 'RENTED':    return `Alquilados (${articles.filter(a => a.status === 'RENTED').length})`;
    }
  };

  const renderRentalHistory = (item: UserArticle) => {
    if (!item.rentals || item.rentals.length === 0) {
      return <Text style={styles.noRentalsText}>Sin historial de alquileres todavía.</Text>;
    }

    const lastThree = [...item.rentals].reverse().slice(0, 3);
    const hasMore = item.rentals.length > 5;

    return (
      <View style={styles.rentalsWrapper}>
        <Text style={styles.rentalsTitle}>Últimos Alquileres:</Text>
        {lastThree.map((rental, index) => (
          <View key={index} style={styles.rentalItem}>
            <View style={styles.rentalMainInfo}>
              <Text style={styles.tenantName}>{rental.tenantName}</Text>
              <Text style={styles.rentalCity}>{`${rental.city ?? ""}, ${rental.country ?? ""}`}</Text>
            </View>
            <View style={styles.rentalDateStatus}>
              <Text style={styles.rentalDates}>
                {`${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}`}
              </Text>
              <Text style={[styles.miniStatus, { color: getStatusColor(rental.status) }]}>
                {rental.status}
              </Text>
            </View>
          </View>
        ))}

        {hasMore && (
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => console.log("Nice")}
          >
            <Text style={styles.viewMoreText}>Ver historial completo ({item.rentals.length})</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderArticle = ({ item }: { item: UserArticle }) => {
    const isDeleting = deletingId === item.id;
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.cardContainer}>
        {/* CUERPO PRINCIPAL (Imagen + Info + Acciones laterales) */}
        <View style={styles.articleCard}>
          <TouchableOpacity
            style={styles.cardPressable}
            onPress={() => handleEdit(item)}
            activeOpacity={0.85}
          >
            <View style={styles.imageContainer}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.articleImage} resizeMode="cover" />
              ) : (
                <View style={styles.noImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                </View>
              )}
            </View>

            <View style={styles.articleInfo}>
              <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.priceRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                <Text style={styles.articlePrice}>{`€${item.pricePerMonth.toFixed(2)}/mes`}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status), alignSelf: 'flex-start' }]}>
                <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* ACCIONES LATERALES (Solo Editar y Borrar) */}
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.editButton}
              onPress={() => handleEdit(item)}
              disabled={isDeleting}
            >
              <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeletePress(item)}
              disabled={isDeleting}
            >
              {isDeleting
                ? <ActivityIndicator size="small" color="#d9534f" />
                : <Ionicons name="trash-outline" size={18} color="#d9534f" />
              }
            </Pressable>
          </View>
        </View>

        {/* BOTÓN INFERIOR PARA DESPLEGAR (La flecha) */}
        <Pressable 
          style={styles.expandButton} 
          onPress={() => toggleExpand(item.id)}
        >
          <Text style={styles.expandText}>
            {isExpanded ? 'Ocultar historial' : 'Ver historial de alquileres'}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#999" 
          />
        </Pressable>

        {/* HISTORIAL DESPLEGABLE */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {renderRentalHistory(item)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando artículos...</Text>
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
        <Text style={styles.headerTitle}>Mis Artículos</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        {(['ALL', 'AVAILABLE', 'RENTED'] as FilterType[]).map((f) => (
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

      {filteredArticles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'ALL'
              ? 'No tienes artículos subidos'
              : `No tienes artículos ${filter === 'AVAILABLE' ? 'disponibles' : 'alquilados'}`}
          </Text>
          <Text style={styles.emptySubtext}>Pulsa el botón + para subir tu primer artículo</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('UploadArticle')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Confirmar eliminación"
        message={`¿Seguro que quieres eliminar "${articleToDelete?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmStyle="destructive"
      />
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
    fontSize: 13,
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
    backgroundColor: '#fff',
  },
  expandText: {
    fontSize: 12,
    color: '#999',
    marginRight: 4,
    fontWeight: '500',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
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
  imageContainer: {
    width: 100,
    height: 100,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimaryHome,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  articlePrice: {
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
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
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  expandedContent: {
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: Spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentalsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
  },
  rentalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tenantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rentalCity: {
    fontSize: 12,
    color: '#888',
  },
  rentalDates: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  miniStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  viewMoreText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
  noRentalsText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  rentalsWrapper: {
    marginTop: 5,
  },
  rentalMainInfo: {
    flex: 1,
  },
  rentalDateStatus: {
    alignItems: 'flex-end',
  },
});

export default MyArticlesScreen;