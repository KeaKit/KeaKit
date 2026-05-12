import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, IncidentResponse, IncidentStatus, IncidentType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAllIncidents } from '../../services/incidentService';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';
import { filterIncidents, computeSummary } from '../../utils/incidentFilters';
import { Helmet } from 'react-helmet-async'; 

export { filterIncidents, computeSummary };

type AdminIncidentsNav = NativeStackNavigationProp<RootStackParamList, 'AdminIncidents'>;

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  OPEN: { label: 'Abierta', color: Colors.warning, icon: 'alert-circle' },
  IN_PROGRESS: { label: 'En progreso', color: Colors.info, icon: 'time' },
  RESOLVED: { label: 'Resuelta', color: Colors.success, icon: 'checkmark-circle' },
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: 'General',
  DAMAGED_ITEM: 'Objeto dañado',
};

const STATUS_OPTIONS: { value: IncidentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Abiertas' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'RESOLVED', label: 'Resueltas' },
];

const TYPE_OPTIONS: { value: IncidentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'GENERAL', label: 'General' },
  { value: 'DAMAGED_ITEM', label: 'Objeto dañado' },
];

const AdminIncidentsScreen: React.FC = () => {
  const navigation = useNavigation<AdminIncidentsNav>();
  const { user } = useAuth();

  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadIncidents = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError('');
    try {
      const data = await getAllIncidents(user.token);
      setIncidents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar incidencias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIncidents();
    }, [user])
  );

  const filteredIncidents = filterIncidents(incidents, statusFilter, typeFilter, searchQuery);
  const summary = computeSummary(incidents);

  const renderStatusBadge = (status: IncidentStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
      </View>
    );
  };

  const handleIncidentPress = (incident: IncidentResponse) => {
    navigation.navigate('IncidentDetail', {
      incidentId: incident.id,
      isReceived: false,
    });
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery.trim() !== '';

  const renderIncidentItem = ({ item }: { item: IncidentResponse }) => (
    <TouchableOpacity
      style={[commonStyles.cardSmall, styles.incidentCard]}
      onPress={() => handleIncidentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.incidentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {renderStatusBadge(item.status)}
      </View>

      <Text style={styles.incidentDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.tagRow}>
          <View style={styles.typeBadge}>
            {item.type === 'DAMAGED_ITEM' ? (
              <Ionicons name="construct" size={14} color={Colors.primaryLight} />
            ) : (
              <Ionicons name="information-circle" size={14} color={Colors.primaryLight} />
            )}
            <Text style={styles.typeText}>{TYPE_LABELS[item.type] || item.type}</Text>
          </View>

          {item.relatedItem && (
            <View style={styles.itemBadge}>
              <Ionicons name="cube" size={14} color={Colors.textSecondary} />
              <Text style={styles.itemText} numberOfLines={1}>
                {item.relatedItem.title}
              </Text>
            </View>
          )}
        </View>

        {item.user && (
          <View style={styles.senderRow}>
            <Ionicons name="person" size={12} color={Colors.textSecondary} />
            <Text style={styles.senderText}>
              Creada por: {item.user.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chevronRow}>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, usuario o email..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtro por estado */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Estado</Text>
        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                statusFilter === option.value && styles.chipActive,
              ]}
              onPress={() => setStatusFilter(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  statusFilter === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filtro por tipo */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Tipo</Text>
        <View style={styles.chipRow}>
          {TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                typeFilter === option.value && styles.chipActive,
              ]}
              onPress={() => setTypeFilter(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  typeFilter === option.value && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters} activeOpacity={0.7}>
          <Ionicons name="close" size={14} color={Colors.primary} />
          <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}

      {/* Contador de resultados */}
      <Text style={styles.resultCount}>
        {filteredIncidents.length} de {incidents.length} incidencias
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Gestión de Incidencias | KeaKit</title> 
        <meta name="description" content="Panel de administración de KeaKit. Gestión y mediación de incidencias entre usuarios." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Cabecera */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Incidencias</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={commonStyles.centerContent}>
          <View style={commonStyles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={commonStyles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity
            style={[commonStyles.primaryButton, styles.retryButton]}
            onPress={() => loadIncidents()}
          >
            <Text style={commonStyles.primaryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Resumen */}
          <View style={[commonStyles.screenPadding, styles.summarySection]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{summary.total}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.warning }]}>
                  {summary.open}
                </Text>
                <Text style={styles.summaryLabel}>Abiertas</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.info }]}>
                  {summary.inProgress}
                </Text>
                <Text style={styles.summaryLabel}>En progreso</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.success }]}>
                  {summary.resolved}
                </Text>
                <Text style={styles.summaryLabel}>Resueltas</Text>
              </View>
            </View>
          </View>

          {/* Filtros + lista */}
          <FlatList
            data={filteredIncidents}
            renderItem={renderIncidentItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderFilters}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadIncidents(true)}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>
                  {hasActiveFilters
                    ? 'No se encontraron incidencias'
                    : 'No hay incidencias en el sistema'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {hasActiveFilters
                    ? 'Prueba cambiando los filtros de búsqueda'
                    : 'Las incidencias creadas por usuarios aparecerán aquí'}
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity
                    style={[commonStyles.outlineButton, { marginTop: Spacing.lg }]}
                    onPress={clearFilters}
                  >
                    <Text style={commonStyles.outlineButtonText}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Resumen
  summarySection: {
    paddingVertical: Spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Filtros
  filtersContainer: {
    paddingBottom: Spacing.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  clearSearchButton: {
    padding: Spacing.xs,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium as '500',
  },
  chipTextActive: {
    color: Colors.textWhite,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  clearFiltersText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium as '500',
  },
  resultCount: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },

  // Lista
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  incidentCard: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  incidentTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium as '500',
  },
  incidentDescription: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: FontSizes.xs,
    color: Colors.primaryLight,
    fontWeight: FontWeights.medium as '500',
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    maxWidth: '60%',
  },
  itemText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  senderText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  chevronRow: {
    position: 'absolute',
    right: Spacing.base,
    top: '50%',
    marginTop: -9,
  },

  // Estado vacío
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.huge,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },

  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
});

export default AdminIncidentsScreen;
