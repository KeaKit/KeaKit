import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KitResponse, KitStatus, RootStackParamList } from "../../types";
import { API_ROUTES } from "../../config/api";
import { Colors, Spacing, commonStyles } from "../../styles";
import { DatePickerModal } from 'react-native-paper-dates';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { es, registerTranslation } from 'react-native-paper-dates';
import { useNavbarOffset } from "../../hooks/useWindowDimensions";
import { Helmet } from 'react-helmet-async'; 

registerTranslation('es', es);

type MyKitsHistoryNav = NativeStackNavigationProp<RootStackParamList, "MyKitsHistory">;

// Tipos para los filtros
type FilterStatus = KitStatus | 'ALL';
type SortOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'name_asc';

interface Filters {
  status: FilterStatus;
  searchText: string;
  sortBy: SortOption;
  dateFrom: string | null;
  dateTo: string | null;
}

// Funciones de utilidad para fechas (igual que en PromoteServiceScreen)
const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const toDisplay = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const MyKitsHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyKitsHistoryNav>();

  // Tema para Paper (igual que en PromoteServiceScreen)
  const customTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.primary,
      onPrimary: '#FFFFFF',
      primaryContainer: '#E3F2FD',
      onPrimaryContainer: Colors.primary,
      surface: '#FFFFFF',
      onSurface: '#1C1B1F',
    },
  };
  const navbarOffset = useNavbarOffset();
  
  // Estados existentes
  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Estados para el selector de fechas (igual que en PromoteServiceScreen)
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Estados para filtros
  const [filters, setFilters] = useState<Filters>({
    status: 'ALL',
    searchText: '',
    sortBy: 'date_desc',
    dateFrom: null,
    dateTo: null,
  });

  // Estado para el modal de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  // Kits filtrados localmente
  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      // Filtro por estado
      if (filters.status !== 'ALL' && kit.status !== filters.status) {
        return false;
      }

      // Filtro por texto de búsqueda (nombre o ciudad)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const nameMatch = kit.name?.toLowerCase().includes(searchLower) || false;
        const cityMatch = kit.city?.toLowerCase().includes(searchLower) || false;
        if (!nameMatch && !cityMatch) return false;
      }

      // Filtro por fecha desde
      if (filters.dateFrom && kit.startDate) {
        if (kit.startDate < filters.dateFrom) return false;
      }

      // Filtro por fecha hasta
      if (filters.dateTo && kit.endDate) {
        if (kit.endDate > filters.dateTo) return false;
      }

      return true;
    }).sort((a, b) => {
      // Ordenación
      switch (filters.sortBy) {
        case 'date_desc':
          return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
        case 'date_asc':
          return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
        case 'price_desc':
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        case 'price_asc':
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });
  }, [kits, filters]);

  const loadHistory = useCallback(async (pageToLoad: number = 0, refresh: boolean = false) => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    try {
      if (pageToLoad === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Construir URL con filtros
      let url = API_ROUTES.MY_KITS_HISTORY(pageToLoad, 10);
      
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.searchText) params.append('search', filters.searchText);
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      if (filters.sortBy) params.append('sort', filters.sortBy);
      
      const queryString = params.toString();
      if (queryString) {
        url += `&${queryString}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const newKits = data.content || [];
      setTotalPages(data.totalPages || 1);
      setHasMore(pageToLoad < (data.totalPages - 1));

      setKits(prev => refresh ? newKits : [...prev, ...newKits]);
      setPage(pageToLoad);
    } catch (err) {
      console.log('[MyKitsHistory] error:', err);
      setError("Error al cargar el historial");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [user, filters]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory(0, true);
  }, [loadHistory]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadHistory(page + 1);
    }
  }, [loadingMore, hasMore, page, loadHistory]);

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    setShowFilters(false);
    loadHistory(0, true);
  }, [tempFilters, loadHistory]);

  const resetFilters = useCallback(() => {
    const defaultFilters: Filters = {
      status: 'ALL',
      searchText: '',
      sortBy: 'date_desc',
      dateFrom: null,
      dateTo: null,
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setShowFilters(false);
    loadHistory(0, true);
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      loadHistory(0, true);
    }, [loadHistory])
  );

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return toDisplay(dateString);
  };

  const getStatusInfo = (status: KitStatus) => {
    switch (status) {
      case KitStatus.PAID:
        return { label: "Pagado", color: "#17a2b8" };
      case KitStatus.ACTIVE:
        return { label: "Activo", color: "#28a745" };
      case KitStatus.FINISHED:
        return { label: "Finalizado", color: "#6c757d" };
      case KitStatus.CANCELLED:
        return { label: "Cancelado", color: "#dc3545" };
      default:
        return { label: status, color: "#999" };
    }
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setTempFilters({ 
      ...tempFilters, 
      dateFrom: null, 
      dateTo: null 
    });
  };

  const renderKit = ({ item }: { item: KitResponse }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.kitCard}
        onPress={() => navigation.navigate("KitDetail", { kitId: item.id })}
      >
        <View style={styles.imageContainer}>
          <View style={styles.kitImagePlaceholder}>
            <Ionicons name="briefcase-outline" size={30} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.kitInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.kitName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.priceTag}>
              {item.totalPrice?.toLocaleString("es-ES")}€
            </Text>
          </View>

          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={13} color="#888" />{" "}
            {item.city}, {item.country}
          </Text>

          <View style={styles.detailsRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Período:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Cargando más...</Text>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <PaperProvider theme={customTheme}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[1]}
              keyExtractor={() => '1'}
              renderItem={() => (
                <>
                  {/* Búsqueda por texto */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Buscar por nombre o ciudad</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Ej: Madrid, Cámara..."
                      value={tempFilters.searchText}
                      onChangeText={(text) => setTempFilters({ ...tempFilters, searchText: text })}
                    />
                  </View>

                  {/* Filtro por estado */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Estado</Text>
                    <View style={styles.statusFilterContainer}>
                      {[
                        { value: 'ALL', label: 'Todos', color: '#999' },
                        { value: KitStatus.PAID, label: 'Pagado', color: '#17a2b8' },
                        { value: KitStatus.ACTIVE, label: 'Activo', color: '#28a745' },
                        { value: KitStatus.FINISHED, label: 'Finalizado', color: '#6c757d' },
                        { value: KitStatus.CANCELLED, label: 'Cancelado', color: '#dc3545' },
                      ].map((status) => (
                        <TouchableOpacity
                          key={status.value}
                          style={[
                            styles.statusFilterButton,
                            tempFilters.status === status.value && styles.statusFilterButtonActive,
                            { borderColor: status.color }
                          ]}
                          onPress={() => setTempFilters({ ...tempFilters, status: status.value as FilterStatus })}
                        >
                          <Text style={[
                            styles.statusFilterText,
                            tempFilters.status === status.value && { color: status.color, fontWeight: 'bold' }
                          ]}>
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* FILTRO POR FECHA - Usando DatePickerModal como en PromoteServiceScreen */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Período de alquiler</Text>
                    
                    <TouchableOpacity
                      style={styles.dateSelector}
                      onPress={() => {
                        // Inicializar fechas si ya existen
                        if (tempFilters.dateFrom) {
                          const [y, m, d] = tempFilters.dateFrom.split('-').map(Number);
                          setStartDate(new Date(y, m - 1, d));
                        }
                        if (tempFilters.dateTo) {
                          const [y, m, d] = tempFilters.dateTo.split('-').map(Number);
                          setEndDate(new Date(y, m - 1, d));
                        }
                        setShowDateRangePicker(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="calendar-outline" size={20} color={Colors.primary} style={styles.dateSelectorIcon} />
                      <Text style={[
                        styles.dateSelectorText,
                        !(tempFilters.dateFrom && tempFilters.dateTo) && styles.dateSelectorPlaceholder
                      ]}>
                        {tempFilters.dateFrom && tempFilters.dateTo
                          ? `${toDisplay(tempFilters.dateFrom)}  →  ${toDisplay(tempFilters.dateTo)}`
                          : 'Selecciona rango de fechas'}
                      </Text>
                      {(tempFilters.dateFrom || tempFilters.dateTo) && (
                        <TouchableOpacity 
                          onPress={clearDateFilter}
                          style={styles.dateClearButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close-circle" size={18} color="#999" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {/* DatePickerModal - igual que en PromoteServiceScreen */}
                    <DatePickerModal
                      locale="es"
                      mode="range"
                      visible={showDateRangePicker}
                      onDismiss={() => setShowDateRangePicker(false)}
                      startDate={startDate}
                      endDate={endDate}
                      allowEditing={false}
                      onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
                        setShowDateRangePicker(false);
                        if (params.startDate && params.endDate) {
                          setStartDate(params.startDate);
                          setEndDate(params.endDate);
                          setTempFilters({
                            ...tempFilters,
                            dateFrom: toIso(params.startDate),
                            dateTo: toIso(params.endDate)
                          });
                        }
                      }}
                      validRange={{ startDate: new Date() }}
                    />
                  </View>

                  {/* Ordenación */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Ordenar por</Text>
                    <View style={styles.sortContainer}>
                      {[
                        { value: 'date_desc', label: 'Más reciente' },
                        { value: 'date_asc', label: 'Más antiguo' },
                        { value: 'price_desc', label: 'Mayor precio' },
                        { value: 'price_asc', label: 'Menor precio' },
                        { value: 'name_asc', label: 'Nombre A-Z' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.sortButton,
                            tempFilters.sortBy === option.value && styles.sortButtonActive
                          ]}
                          onPress={() => setTempFilters({ ...tempFilters, sortBy: option.value as SortOption })}
                        >
                          <Text style={[
                            styles.sortButtonText,
                            tempFilters.sortBy === option.value && styles.sortButtonTextActive
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            />

            {/* Botones de acción */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Resetear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </PaperProvider>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, {paddingBottom: navbarOffset}]}>
      <Helmet>
        <title>Historial de alquileres | KeaKit</title>
        <meta name="description" content="Consulta el historial de tus alquileres en KeaKit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>      
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Alquileres</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setTempFilters(filters);
            setShowFilters(true);
          }}
        >
          <Ionicons 
            name="filter" 
            size={24} 
            color={filters.status !== 'ALL' || filters.searchText || filters.sortBy !== 'date_desc' || filters.dateFrom || filters.dateTo
              ? Colors.primary 
              : '#666'
            } 
          />
          {(filters.status !== 'ALL' || filters.searchText || filters.sortBy !== 'date_desc' || filters.dateFrom || filters.dateTo) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda rápida */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBarInput}
          placeholder="Buscar por nombre o ciudad..."
          placeholderTextColor="#999"
          value={filters.searchText}
          onChangeText={(text) => {
            setFilters({ ...filters, searchText: text });
          }}
          onSubmitEditing={() => loadHistory(0, true)}
          returnKeyType="search"
        />
        {filters.searchText ? (
          <TouchableOpacity 
            style={styles.searchClearButton}
            onPress={() => {
              setFilters({ ...filters, searchText: '' });
              loadHistory(0, true);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chips de filtros rápidos */}
      <View style={styles.quickFiltersContainer}>
        {[
          { value: KitStatus.ACTIVE, label: 'Activos', color: '#28a745' },
          { value: KitStatus.FINISHED, label: 'Finalizados', color: '#6c757d' },
          { value: KitStatus.CANCELLED, label: 'Cancelados', color: '#dc3545' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.quickFilterChip,
              filters.status === filter.value && styles.quickFilterChipActive,
              filters.status === filter.value && { backgroundColor: filter.color }
            ]}
            onPress={() => {
              setFilters({ 
                ...filters, 
                status: filters.status === filter.value ? 'ALL' : filter.value 
              });
              loadHistory(0, true);
            }}
          >
            <Text style={[
              styles.quickFilterChipText,
              filters.status === filter.value && styles.quickFilterChipTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Indicador de filtros activos */}
      {(filters.status !== 'ALL' || filters.searchText || filters.sortBy !== 'date_desc' || filters.dateFrom || filters.dateTo) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText} numberOfLines={2}>
            <Ionicons name="funnel-outline" size={12} color={Colors.primary} />{' '}
            {filters.status !== 'ALL' && ` ${getStatusInfo(filters.status as KitStatus).label}`}
            {filters.searchText && ` · "${filters.searchText}"`}
            {filters.dateFrom && ` · Desde: ${toDisplay(filters.dateFrom)}`}
            {filters.dateTo && ` · Hasta: ${toDisplay(filters.dateTo)}`}
            {filters.sortBy !== 'date_desc' && ` · Orden: ${
              filters.sortBy === 'date_asc' ? 'Más antiguo' : 
              filters.sortBy === 'price_desc' ? 'Mayor precio' : 
              filters.sortBy === 'price_asc' ? 'Menor precio' : 'Nombre A-Z'
            }`}
          </Text>
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={resetFilters}
          >
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadHistory(0, true)}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : filteredKits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No hay resultados</Text>
          <Text style={styles.emptySubtext}>
            {filters.status !== 'ALL' || filters.searchText || filters.dateFrom || filters.dateTo
              ? "Prueba con otros filtros"
              : "Los kits que alquiles aparecerán aquí cuando finalicen o sean cancelados"}
          </Text>
          {(filters.status !== 'ALL' || filters.searchText || filters.dateFrom || filters.dateTo) && (
            <TouchableOpacity style={styles.resetButtonSmall} onPress={resetFilters}>
              <Text style={styles.resetButtonSmallText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredKits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKit}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Estilos del header y navegación
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  filterButton: {
    padding: Spacing.sm,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Estilos de contenedores principales
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    padding: Spacing.md,
  },

  // Estilos de las tarjetas de kit
  kitCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 8,
    overflow: "hidden",
  },
  kitImagePlaceholder: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  kitInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kitName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  locationText: {
    fontSize: 12,
    color: "#888",
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 10,
    color: "#999",
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  // Estilos de empty state y errores
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos del footer de carga
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },

  // Estilos de la barra de búsqueda
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  searchClearButton: {
    padding: 4,
  },

  // Estilos del contenedor de filtros activos
  activeFiltersContainer: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFiltersText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  clearFiltersButton: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginLeft: Spacing.sm,
  },
  clearFiltersText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Estilos del modal de filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: 14,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilterButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  statusFilterButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#666',
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  resetButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonSmall: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resetButtonSmallText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  quickFilterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickFilterChipText: {
    fontSize: 12,
    color: '#666',
  },
  quickFilterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Estilos para el selector de fecha
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateSelectorIcon: {
    marginRight: Spacing.sm,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dateSelectorPlaceholder: {
    color: '#999',
    fontWeight: 'normal',
  },
  dateClearButton: {
    padding: 4,
    marginLeft: 4,
  },
  modalScrollContent: {
    paddingBottom: Spacing.md,
  },
});

export default MyKitsHistoryScreen;