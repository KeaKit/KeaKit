import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { getArticleRecord } from '../../services/articleService';
import { RootStackParamList, ArticleRecordDTO, KitStatus } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_ROUTES } from '../../config/api';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';
import { Helmet } from 'react-helmet-async'; 

type ArticleRentals = NativeStackNavigationProp<RootStackParamList, 'ArticleRentals'>;
type ArticleRentalsRoute = RouteProp<RootStackParamList, 'ArticleRentals'>;

const ArticleRentalsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ArticleRentals>();
  const navbarOffset = useNavbarOffset();
  const route = useRoute<ArticleRentalsRoute>();
  const { articleId, articleTitle } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rentals, setRentals] = useState<ArticleRecordDTO[]>([]);
  const [ratedItems, setRatedItems] = useState<{ [key: number]: boolean }>({});

const loadRecords = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getArticleRecord(articleId, user.token);
      setRentals(data);

      if (data.length > 0) {
        const kitIds = data.map((rental: ArticleRecordDTO) => rental.kitId);

        fetch(`${API_ROUTES.HAS_REVIEWED_ITEM_IN_KITS}?reviewerId=${user.id}&itemId=${articleId}&kitIds=${kitIds.join(',')}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
          .then(res => res.json())
          .then((res: { [key: number]: boolean }) => {
            setRatedItems(res); 
            console.log(res);
          })
          .catch(err => console.error("Error al obtener estados de valoración:", err));
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [articleId])
  );

  const sections = useMemo(() => {
    if (rentals.length === 0) return [];
    
    const active = rentals.filter(r => r.status !== KitStatus.FINISHED );
    const past = rentals.filter(r => r.status === KitStatus.FINISHED);

    return [
      { title: 'Alquileres Actuales', data: active },
      { title: 'Historial Pasado', data: past },
    ];
  }, [rentals]);

  const createReview = (kitId: number, tenantId: number, tenantName: string) => {
    navigation.navigate('CreateRating', {
      kitId: kitId, 
      revieweeId: tenantId,
      revieweeName: tenantName
    });
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case KitStatus.ACTIVE:
        return { label: 'ACTIVO', color: '#28a745', bg: '#eafaf1' };
      case 'PAID':
        return { label: 'PAGADO', color: '#007bff', bg: '#e7f1ff' };
      case 'FINISHED':
        return { label: 'FINALIZADO', color: '#6c757d', bg: '#f8f9fa' };
      default:
        return { label: status, color: '#999', bg: '#f0f0f0' };
    }
  };

  const navigateToUserReviews = (tenantId: number, tenantName: string) => {
    navigation.navigate('UserRatings', {
      userId: tenantId,
      userName: tenantName,
    });
  };

  const renderItem = ({ item }: { item: ArticleRecordDTO }) => {
    const config = getStatusConfig(item.status);
    const alreadyRated = ratedItems[item.kitId];

    return (
      <View style={styles.rentalCard}>
        <View style={styles.cardMain}>
          <View style={styles.tenantInfo}>
            <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
            <View style={styles.textGap}>
              <Text
                style={{ color: "#007AFF" }}
                onPress={() => navigateToUserReviews(item.tenantId, item.tenantName)}
              >
                {item.tenantName}
              </Text>
              <Text style={styles.locationText}>{`${item.city}, ${item.country}`}</Text>
            </View>
          </View>

          {item.status === 'FINISHED' && (
            <TouchableOpacity
              style={[styles.rateButton, alreadyRated && { opacity: 0.5 }]}
              onPress={() => !alreadyRated && createReview(item.kitId, item.tenantId, item.tenantName)}
              disabled={alreadyRated}
            >
              <Ionicons 
                name={alreadyRated ? "star" : "star-outline"} 
                size={16} 
                color={alreadyRated ? "#FFCC00" : Colors.primary} 
              />
              <Text style={[styles.rateButtonText, alreadyRated && { color: '#999' }]}>
                {alreadyRated ? "Valorado" : "Valorar"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateBlock}>
            <Text style={styles.label}>Periodo</Text>
            <Text style={styles.value}>{formatDate(item.startDate)} - {formatDate(item.endDate)}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.container, {paddingBottom: navbarOffset}]}>
      <Helmet>
        <title>Historial de alquileres | KeaKit</title>
        <meta name="description" content="Historial de alquileres de artículos en la plataforma KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Historial</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{articleTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title, data } }) => (
            data.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            ) : null
          )}
          contentContainerStyle={styles.listPadding}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRecords(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Este artículo no ha sido alquilado todavía.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backBtn: { padding: Spacing.sm },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  listPadding: { padding: Spacing.md },
  sectionHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#999', textTransform: 'uppercase' },
  rentalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardMain: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  tenantInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textGap: { marginLeft: 10 },
  tenantName: { fontSize: 15, fontWeight: '600', color: '#333' },
  locationText: { fontSize: 12, color: '#888' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  cardFooter: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#f9f9f9' },
  dateBlock: { flexDirection: 'column' },
  label: { fontSize: 10, color: '#bbb', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 13, color: '#444', fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#999', textAlign: 'center' },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 5,
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
});

export default ArticleRentalsScreen;