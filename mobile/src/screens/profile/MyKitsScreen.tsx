import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KitResponse, KitStatus, RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';

type MyKitsNav = NativeStackNavigationProp<RootStackParamList, 'MyKits'>;

const MyKitsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<MyKitsNav>();

  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadKits = async () => {
        if (!user) return;
        try {
          setLoading(true);
          const response = await fetch(`http://10.0.2.2:8080/api/kits/my-kits/${user.id}`);
          const data = await response.json();
          setKits(data);
        } catch (err) {
          setError('Error al cargar alquileres');
        } finally {
          setLoading(false);
        }
      };
      loadKits();
    }, [user])
  ); 

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
  };

  const getStatusInfo = (status: KitStatus) => {
  switch (status) {
    case KitStatus.PENDING: return { label: 'Pendiente de pago', color: '#fd7e14' };
    case KitStatus.PAID: return { label: 'Pagado', color: '#17a2b8' };
    case KitStatus.PENDING_VALIDATION: return { label: 'Pendiente de validación', color: '#ffc107' };
    case KitStatus.ACTIVE: return { label: 'Activo', color: '#28a745' };
    case KitStatus.COMPLETED: return { label: 'Completado', color: '#6c757d' };
    case KitStatus.CANCELLED: return { label: 'Cancelado', color: '#dc3545' };

    default:
      return { label: status, color: '#999' };
  }
};

  const renderKit = ({ item }: { item: KitResponse }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity 
        style={styles.kitCard}
        onPress={() => navigation.navigate('KitDetail', { kitId: item.id })}
      >
        <View style={styles.imageContainer}>
          <View style={styles.kitImagePlaceholder}>
            <Ionicons name="briefcase-outline" size={30} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.kitInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.kitName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.priceTag}>{item.totalPrice?.toLocaleString('es-ES')}€</Text>
          </View>

          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={13} color="#888" /> {item.city}, {item.country}
          </Text>

          {item.deliveryNotification ? (
            <Text style={styles.deliveryNoticeText}>
              {item.deliveryNotification}
            </Text>
          ) : null}

          <View style={styles.detailsRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Fin alquiler:</Text>
              <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Sincronizando tus kits...</Text>
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
        <Text style={styles.headerTitle}>Mis Alquileres</Text>
        <View style={styles.headerRight} />
      </View>

      {kits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-full-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tienes alquileres vigentes</Text>
          <Text style={styles.emptySubtext}>Explora el catálogo para alquilar tu primer kit de artículos</Text>
        </View>
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKit}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingText: { marginTop: Spacing.md, fontSize: 16, color: '#666' },
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  headerRight: { width: 40 },
  listContent: { padding: Spacing.md },
  kitCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: { width: 85, height: 85, borderRadius: 8, overflow: 'hidden' },
  kitImagePlaceholder: { flex: 1, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center' },
  kitInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kitName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 4 },
  priceTag: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  locationText: { fontSize: 12, color: '#888', marginVertical: 4 },
  deliveryNoticeText: { fontSize: 12, color: Colors.primary, marginTop: 2, marginBottom: 4, fontWeight: '600' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  dateContainer: { alignItems: 'flex-end' },
  dateLabel: { fontSize: 10, color: '#999' },
  dateValue: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: Spacing.md, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: Spacing.sm, textAlign: 'center' },
});

export default MyKitsScreen;