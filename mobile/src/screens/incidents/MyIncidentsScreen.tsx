import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, IncidentResponse, IncidentStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getIncidentsByUser, getReceivedIncidents } from '../../services/incidentService';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';
import { Helmet } from 'react-helmet-async'; 


type MyIncidentsNav = NativeStackNavigationProp<RootStackParamList, 'MyIncidents'>;
type TabType = 'sent' | 'received';

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  OPEN: { label: 'Abierta', color: Colors.warning, icon: 'alert-circle' },
  IN_PROGRESS: { label: 'En progreso', color: Colors.info, icon: 'time' },
  RESOLVED: { label: 'Resuelta', color: Colors.success, icon: 'checkmark-circle' },
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: 'General',
  DAMAGED_ITEM: 'Objeto dañado',
};

const MyIncidentsScreen: React.FC = () => {
  const navigation = useNavigation<MyIncidentsNav>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('sent');
  const [sentIncidents, setSentIncidents] = useState<IncidentResponse[]>([]);
  const [receivedIncidents, setReceivedIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadIncidents = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError('');
    try {
      const [sent, received] = await Promise.all([
        getIncidentsByUser(user.id, user.token),
        getReceivedIncidents(user.id, user.token),
      ]);
      setSentIncidents(sent);
      setReceivedIncidents(received);
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

  const currentIncidents = activeTab === 'sent' ? sentIncidents : receivedIncidents;

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
      isReceived: activeTab === 'received',
    });
  };

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

        {activeTab === 'received' && item.user && (
          <View style={styles.senderRow}>
            <Ionicons name="person" size={12} color={Colors.textSecondary} />
            <Text style={styles.senderText}>
              Enviada por: {item.user.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chevronRow}>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Centro de incidencias | KeaKit</title>
        <meta name="description" content="Gestiona todas tus incidencias en KeaKit. Revisa solicitudes enviadas y recibidas relacionadas con tus alquileres, artículos y servicios."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>        
      {/* Cabecera */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Mis Incidencias</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Pestañas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={16}
            color={activeTab === 'sent' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Enviadas
          </Text>
          {sentIncidents.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'sent' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'sent' && styles.tabBadgeTextActive]}>
                {sentIncidents.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="mail"
            size={16}
            color={activeTab === 'received' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Recibidas
          </Text>
          {receivedIncidents.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'received' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'received' && styles.tabBadgeTextActive]}>
                {receivedIncidents.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
                <Text style={styles.summaryNumber}>{currentIncidents.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.warning }]}>
                  {currentIncidents.filter((i) => i.status === 'OPEN').length}
                </Text>
                <Text style={styles.summaryLabel}>Abiertas</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.info }]}>
                  {currentIncidents.filter((i) => i.status === 'IN_PROGRESS').length}
                </Text>
                <Text style={styles.summaryLabel}>En progreso</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: Colors.success }]}>
                  {currentIncidents.filter((i) => i.status === 'RESOLVED').length}
                </Text>
                <Text style={styles.summaryLabel}>Resueltas</Text>
              </View>
            </View>
          </View>

          {/* Lista */}
          <FlatList
            data={currentIncidents}
            renderItem={renderIncidentItem}
            keyExtractor={(item) => item.id.toString()}
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
                <Ionicons
                  name="chatbubble"
                  size={64}
                  color={Colors.textLight}
                />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'sent'
                    ? 'No has enviado incidencias'
                    : 'No has recibido incidencias'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'sent'
                    ? 'Cuando crees una incidencia, aparecerá aquí'
                    : 'Las incidencias sobre tus objetos aparecerán aquí'}
                </Text>
              </View>
            }
          />

          {/* Botón flotante de creación — solo en la pestaña "enviadas" */}
          {activeTab === 'sent' && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('CreateIncident')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={Colors.textWhite} />
              <Text style={styles.fabText}>Crear Incidencia</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Pestañas
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold as '600',
  },
  tabBadge: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: Colors.primary,
  },

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

  // Lista
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  incidentCard: {
    marginBottom: Spacing.xs,
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
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
  },

  // Botón flotante de acción (FAB)
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    left: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: Colors.textWhite,
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold as '700',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
});

export default MyIncidentsScreen;
