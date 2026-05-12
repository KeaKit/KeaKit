import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Pressable, Image, Modal, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserArticle, Category, ArticleRecordDTO } from '../../types';
import { fetchAllCategories } from '../../services/categoryService';
import { getMyArticles, deleteArticle, getArticleById, getArticleRecord, processArticleReturn } from '../../services/articleService';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useNotification } from '../../components/NotificationContext'; 
import { ConfirmModal } from '../../components/ConfirmModal'; 
import { SelectPicker } from '../../components/SelectPicker';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DatePickerModal, es, registerTranslation } from 'react-native-paper-dates';
import { formatOwnerCommissionPromoBadgeLabel } from '../../utils/ownerCommissionPromo';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';

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

// Constante para precio máximo razonable
const MAX_PRICE = 999999999;

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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MyArticlesScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyArticlesNav>();
  const navbarOffset = useNavbarOffset();
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
  const [priceError, setPriceError] = useState<string>('');

  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Estados para la devolución
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [articleToReturn, setArticleToReturn] = useState<UserArticle | null>(null);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  const hydrateRentedArticles = useCallback(async (data: UserArticle[]) => {
    if (!user) return data;

    const rentedArticles = data.filter(article => article.status === 'RENTED');
    if (rentedArticles.length === 0) return data;

    const rentalEntries: Array<readonly [number, ArticleRecordDTO[]]> = await Promise.all(
      rentedArticles.map(async (article) => {
        try {
          const rentals = await getArticleRecord(article.id, user.token);
          return [article.id, rentals] as const;
        } catch {
          return [article.id, [] as ArticleRecordDTO[]] as const;
        }
      })
    );

    const rentalsByArticleId = new Map(rentalEntries);

    return data.map(article => ({
      ...article,
      rentals: rentalsByArticleId.get(article.id) ?? article.rentals,
    }));
  }, [user]);

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
      const hydratedData = await hydrateRentedArticles(data);
      setArticles(hydratedData);
      setFilteredArticles(applyFilter(filter, hydratedData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar artículos');
      showNotification('Error al cargar los artículos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setExpandedId(null);
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
          const hydratedData = await hydrateRentedArticles(data);
          setArticles(hydratedData);
          setFilteredArticles(applyFilter(filter, hydratedData));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar artículos');
          showNotification('Error al cargar los artículos', 'error');
        } finally {
          setLoading(false);
        }
      };
      loadArticles();
    }, [filter, hydrateRentedArticles, showNotification, user])
  );

  const sanitizePriceInput = (text: string): string => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    const match = cleaned.match(/^\d*(\.\d{0,2})?/);
    return match ? match[0] : '';
  };

  const validatePriceRange = (min: string, max: string): boolean => {
    if (!min && !max) {
      setPriceError('');
      return true;
    }
    
    const minNum = min ? parseFloat(min) : 0;
    const maxNum = max ? parseFloat(max) : Infinity;
    
    if (min && isNaN(minNum)) {
      setPriceError('Precio mínimo inválido');
      return false;
    }
    
    if (max && isNaN(maxNum)) {
      setPriceError('Precio máximo inválido');
      return false;
    }
    
    if (minNum < 0) {
      setPriceError('El precio no puede ser negativo');
      return false;
    }
    
    if (maxNum < 0) {
      setPriceError('El precio no puede ser negativo');
      return false;
    }
    
    if (min && max && minNum > maxNum) {
      setPriceError('El precio mínimo no puede ser mayor que el máximo');
      return false;
    }
    
    setPriceError('');
    return true;
  };

  const handleMinPriceChange = (text: string) => {
    const sanitized = sanitizePriceInput(text);
    setMinPrice(sanitized);
    validatePriceRange(sanitized, maxPrice);
  };

  const handleMaxPriceChange = (text: string) => {
    const sanitized = sanitizePriceInput(text);
    setMaxPrice(sanitized);
    validatePriceRange(minPrice, sanitized);
  };

  const handleApplyAdvancedFilters = () => {
    if (!validatePriceRange(minPrice, maxPrice)) {
      showNotification(priceError || 'Revisa los valores de precio', 'error');
      return;
    }
    setFiltersModalVisible(false);
    loadArticles();
  };

  const handleClearFilters = () => {
    setSelectedCategoryId('');
    setSelectedCondition('');
    setMinPrice("");
    setMaxPrice("");
    setPriceError("");
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

  const openReturnModal = (item: UserArticle) => {
    setArticleToReturn(item);
    setReturnModalVisible(true);
  };

  const handleProcessReturn = async (condition: 'GOOD' | 'DAMAGED') => {
    if (!user || !articleToReturn) return;
    setIsProcessingReturn(true);
    
    try {
      const response = await processArticleReturn(articleToReturn.id, user.id, condition, user.token);
      showNotification(response.message || 'Devolución procesada correctamente', 'success');
      setReturnModalVisible(false);
      setArticleToReturn(null);
      loadArticles(true);
    } catch (err: any) {
      showNotification(err.message || 'No se pudo procesar la devolución', 'error');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalVisible(false);
    setArticleToDelete(null);
  };

  const navigateToUserReviews = (tenantId: number, tenantName: string) => {
    navigation.navigate('UserRatings', {
      userId: tenantId,
      userName: tenantName,
    });
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
      case 'ACTIVE':    return 'Activo';
      case 'PAID':      return 'Pagado';
      case 'FINISHED':  return 'Finalizado';
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

    return (
      <View style={styles.rentalsWrapper}>
        <Text style={styles.rentalsTitle}>Últimos Alquileres:</Text>
        {lastThree.map((rental, index) => (
          <View key={index} style={styles.rentalItem}>
            <View style={styles.rentalMainInfo}>
              <Text
                style={{ color: "#007AFF" }}
                onPress={() => navigateToUserReviews(rental.tenantId, rental.tenantName)}
              >
                {rental.tenantName}
              </Text>
              <Text style={styles.rentalCity}>{`${rental.city ?? ""}, ${rental.country ?? ""}`}</Text>
            </View>
            <View style={styles.rentalDateStatus}>
              <Text style={styles.rentalDates}>
                {`${formatDate(rental.startDate)} - ${formatDate(rental.endDate)}`}
              </Text>
              <Text style={[styles.miniStatus, { color: getStatusColor(rental.status) }]}>
                {translateStatus(rental.status)}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("ArticleRentals", { articleId: item.id, articleTitle: item.title })}
        >
          <Text style={styles.viewMoreText}>Ver historial completo ({item.rentals.length})</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderArticle = ({ item }: { item: UserArticle }) => {
    const isDeleting = deletingId === item.id;
    const isExpanded = expandedId === item.id;
    const ownerPromoBadgeLabel = formatOwnerCommissionPromoBadgeLabel(item.ownerCommissionPromoCode);
    const hasPaidRental = item.rentals?.some(rental => rental.status === 'PAID') ?? false;

    return (
      <View style={styles.cardContainer}>
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
              {ownerPromoBadgeLabel ? (
                <View
                  style={styles.ownerPromoBadge}
                  testID={`owner-promo-badge-${item.id}`}
                  accessibilityLabel={ownerPromoBadgeLabel}
                >
                  <Ionicons name="pricetag-outline" size={13} color="#2f7d50" />
                  <Text style={styles.ownerPromoText} numberOfLines={1}>
                    {ownerPromoBadgeLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

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

        {/* BOTÓN DE DEVOLUCIÓN (SOLO SI ESTÁ ALQUILADO) */}
        {item.status === 'RENTED' && !hasPaidRental && (
          <View style={styles.returnButtonWrapper}>
            <TouchableOpacity 
              style={styles.returnButtonOutlined}
              onPress={() => openReturnModal(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.returnButtonText}>Evaluar Devolución</Text>
            </TouchableOpacity>
          </View>
        )}

        <Pressable 
          style={styles.expandButton} 
          onPress={() => toggleExpand(item.id)}
        >
          <Text style={styles.expandText}>
            {isExpanded ? 'Ocultar historial' : 'Ver alquileres más recientes'}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#999" 
          />
        </Pressable>

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
            contentContainerStyle={[styles.listContent, { paddingBottom: navbarOffset > 0 ? navbarOffset + 74 : 90 }]}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { bottom: navbarOffset > 0 ? navbarOffset + 10 : 28}]}
          onPress={() => navigation.navigate('UploadArticle')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        {/* MODAL DE FILTROS AVANZADOS */}
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
                <View style={[styles.priceInputWrapper, priceError ? styles.priceInputWrapperError : null]}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Mín"
                    keyboardType="decimal-pad"
                    value={minPrice}
                    onChangeText={handleMinPriceChange}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <Text style={styles.priceSeparator}>a</Text>

                <View style={[styles.priceInputWrapper, priceError ? styles.priceInputWrapperError : null]}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Máx"
                    keyboardType="decimal-pad"
                    value={maxPrice}
                    onChangeText={handleMaxPriceChange}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              {priceError ? <Text style={styles.priceErrorText}>{priceError}</Text> : null}

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

        {/* Modal de confirmación de Devolución */}
        <Modal visible={returnModalVisible} animationType="fade" transparent={true}>
          <View style={styles.returnModalOverlay}>
            <View style={styles.returnModalCard}>
              <View style={styles.returnModalHeader}>
                <View style={styles.returnIconContainer}>
                  <Ionicons name="cube-outline" size={28} color={Colors.primary} />
                </View>
                <TouchableOpacity style={styles.closeIcon} onPress={() => setReturnModalVisible(false)} disabled={isProcessingReturn}>
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.returnModalTitle}>Confirmar Recepción</Text>
              <Text style={styles.returnModalSubtitle}>
                ¿En qué estado ha devuelto el arrendatario el artículo <Text style={{ fontWeight: 'bold', color: '#333' }}>"{articleToReturn?.title}"</Text>?
              </Text>

              {isProcessingReturn ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.processingText}>Procesando devolución...</Text>
                </View>
              ) : (
                <View style={styles.returnModalActions}>
                  <TouchableOpacity 
                    style={styles.successActionCard}
                    onPress={() => handleProcessReturn('GOOD')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.successIconBg}>
                      <Ionicons name="checkmark" size={24} color="#28a745" />
                    </View>
                    <View style={styles.actionCardText}>
                      <Text style={styles.actionCardTitle}>En buen estado</Text>
                      <Text style={styles.actionCardDesc}>Se devolverá la garantía al inquilino</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.dangerActionCard}
                    onPress={() => handleProcessReturn('DAMAGED')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.dangerIconBg}>
                      <Ionicons name="warning-outline" size={24} color="#d9534f" />
                    </View>
                    <View style={styles.actionCardText}>
                      <Text style={styles.actionCardTitle}>Con daños</Text>
                      <Text style={styles.actionCardDesc}>Se retendrá la garantía a tu favor</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
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
  ownerPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#eaf7ef',
    borderWidth: 1,
    borderColor: '#bfe8cf',
    maxWidth: '100%',
  },
  ownerPromoText: {
    marginLeft: 4,
    color: '#2f7d50',
    fontSize: 12,
    fontWeight: '700',
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
  priceInputWrapperError: {
    borderColor: Colors.error,
    borderWidth: 1,
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
  priceErrorText: {
    fontSize: 11,
    color: Colors.error,
    marginTop: 4,
    marginBottom: 0,
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
  processReturnButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  processReturnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // --- ESTILOS DEL BOTÓN DE DEVOLUCIÓN ---
  returnButtonWrapper: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: '#fff',
  },
  returnButtonOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    gap: 6,
  },
  returnButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // --- ESTILOS DEL MODAL DE DEVOLUCIÓN ---
  returnModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  returnModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  returnModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  returnIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  returnModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  returnModalSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  returnModalActions: {
    gap: Spacing.md,
  },
  successActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff9',
    borderWidth: 1,
    borderColor: '#c3e6cb',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.md,
  },
  successIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2f0e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffafa',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.md,
  },
  dangerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdecea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 13,
    color: '#666',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  processingText: {
    marginTop: Spacing.md,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default MyArticlesScreen;
