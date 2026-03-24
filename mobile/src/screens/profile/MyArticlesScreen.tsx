import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Pressable, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getMyArticles, deleteArticle, getArticleById } from '../../services/articleService';
import { RootStackParamList, UserArticle, Category } from '../../types';
import { fetchAllCategories } from '../../services/categoryService';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useNotification } from '../../components/NotificationContext'; 
import { ConfirmModal } from '../../components/ConfirmModal'; 
import { SelectPicker } from '../../components/SelectPicker';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DatePickerModal, es, registerTranslation } from 'react-native-paper-dates';

type MyArticlesNav = NativeStackNavigationProp<RootStackParamList, 'MyArticles'>;
type FilterType = 'ALL' | 'AVAILABLE' | 'RENTED';
registerTranslation('es', es);

const CONDITION_OPTIONS = [
  { value: '', label: 'Cualquier estado' },
  { value: 'NEW', label: 'Nuevo' },
  { value: 'LIGHTLY_USED', label: 'Poco usado' },
  { value: 'USED', label: 'Usado' },
  { value: 'WORN', label: 'Desgastado' },
];

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: Colors.primary,
    surface: '#FFFFFF',
  },
};

const MyArticlesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyArticlesNav>();
  const { showNotification } = useNotification(); 

  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Estados para el modal de confirmación
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<UserArticle | null>(null);

  // Estados de Filtros Avanzados
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      if (!user) return;
      try {
        const data = await fetchAllCategories(user.token);
        setCategories(data.filter(c => c.status === 'ACTIVE'));
      } catch (err) {
        console.error('Error cargando categorías', err);
      }
    };
    loadCategories();
  }, [user]);

  const loadArticles = async (ignoreFilters = false) => {
    if (!user) {
      setError('Debes iniciar sesión para ver tus artículos');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const queryFilters = ignoreFilters ? {} : {
        categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
        condition: selectedCondition || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      };

      const data = await getMyArticles(user.id, user.token, queryFilters);
      setArticles(data);
      setFilteredArticles(applyFilter(filter, data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar artículos');
      showNotification('Error al cargar los artículos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadArticles();
    }, [user])
  );

  const handleApplyAdvancedFilters = () => {
    setFiltersModalVisible(false);
    loadArticles();
  };

  const handleClearFilters = () => {
    setSelectedCategoryId('');
    setSelectedCondition('');
    setMinPrice("");
    setMaxPrice("");
    setFiltersModalVisible(false);
    loadArticles(true); 
  };

  
  const activeAdvancedFiltersCount = [selectedCategoryId, selectedCondition, minPrice, maxPrice].filter(Boolean).length;

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
      showNotification(err.message || 'No se pudo cargar el artículo', 'error');
    }
  };

  const handleDeletePress = (item: UserArticle) => {
    if (item.status === 'RENTED') {
      showNotification(
        'Este artículo está actualmente alquilado. Espera a que finalice el alquiler para eliminarlo.',
        'error'
      ); 
      return;
    }
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
      showNotification('Artículo eliminado correctamente', 'success'); 
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'No se pudo eliminar el artículo',
        'error'
      ); 
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

  const renderArticle = ({ item }: { item: UserArticle }) => {
    const isDeleting = deletingId === item.id;
    return (
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
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
              </View>
            </View>
            {item.status === 'RENTED' && item.rentedUntil && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateText}>{`Hasta: ${formatDate(item.rentedUntil)}`}</Text>
              </View>
            )}
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
      <PaperProvider theme={customTheme}>
        <SafeAreaView style={commonStyles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando artículos...</Text>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  if (error) {
    return (
      <PaperProvider theme={customTheme}>
        <SafeAreaView style={commonStyles.container}>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#d9534f" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.retryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Artículos</Text>
          
          {/* PASO 5: BOTÓN EN EL HEADER */}
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setFiltersModalVisible(true)} style={styles.filterIconButton}>
              <Ionicons name="options-outline" size={24} color={activeAdvancedFiltersCount > 0 ? Colors.primary : '#666'} />
              {activeAdvancedFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeAdvancedFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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

        {/* PASO 6: MODAL DE FILTROS AVANZADOS */}
        <Modal visible={filtersModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros Avanzados</Text>
                <TouchableOpacity onPress={() => setFiltersModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.pickerWrapper}>
                <SelectPicker
                  options={[
                    { label: 'Todas las categorías', value: '' },
                    ...categories.map(c => ({ label: c.name, value: c.id.toString() }))
                  ]}
                  selectedValue={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                  placeholder="Selecciona una categoría"
                />
              </View>

              <Text style={styles.filterLabel}>Condición</Text>
              <View style={styles.pickerWrapper}>
                <SelectPicker
                  options={CONDITION_OPTIONS}
                  selectedValue={selectedCondition}
                  onValueChange={setSelectedCondition}
                  placeholder="Cualquier estado"
                />
              </View>

              <Text style={styles.filterLabel}>Rango de Precios</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Mín"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <Text style={styles.priceSeparator}>a</Text>

                <View style={styles.priceInputWrapper}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Máx"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyAdvancedFilters}>
                  <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    </PaperProvider>
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
  articleCard: {
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

  filterIconButton: { padding: Spacing.sm, position: 'relative' },
  filterBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#d9534f', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: Spacing.xs, marginTop: Spacing.md },
  pickerWrapper: { backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: Spacing.sm },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', padding: Spacing.md, borderRadius: 8, gap: Spacing.sm },
  datePlaceholderText: { color: '#999', fontSize: 16 },
  dateSelectedText: { color: '#333', fontSize: 16 },
  modalActions: { flexDirection: 'row', marginTop: Spacing.xl, gap: Spacing.md },
  clearButton: { flex: 1, padding: Spacing.md, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center' },
  clearButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
  applyButton: { flex: 2, padding: Spacing.md, borderRadius: 8, backgroundColor: Colors.primary, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 5,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceIcon: {
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  priceSeparator: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    marginHorizontal: 4,
  },
});

export default MyArticlesScreen;