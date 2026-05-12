import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RentedItemResponse, UserArticle, DeliveryStatus, KitResponse, DemandAnalysisItem } from '../../types';
import { Colors } from '../../styles';
import { getLoggedUserWallet, getRentedItems, getMyArticles, getTopDemandedItems } from '../../services';
import { SkeletonPulse, FadeInItem } from '../../components';
import ProfileMenuModal from './ProfileMenuModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTrackingNotifications } from "../../context/TrackingNotificationContext";
import { getMyKits, getKitTracking, getUpdatrableTrackingKits } from "../../services/kitService";
import { useNavbarOffset } from '../../hooks/useWindowDimensions';
import { Helmet } from 'react-helmet-async'; 

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Status ENUM for item status
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  AVAILABLE: { label: 'Disponible', dot: '#10B981' }, 
  RENTED:    { label: 'Alquilado',  dot: '#F59E0B' }, 
  DEFAULT:   { label: 'Inactivo',   dot: '#9CA3AF' }, 
};

const LAST_UPDATES_KEY = "@tracking_last_updates";

// Main Component
const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HomeNav>();
  const navbarOffset = useNavbarOffset();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { width } = useWindowDimensions();
  
  // Determinar si es móvil, tablet o desktop
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [rentedItems, setRentedItems] = useState<RentedItemResponse[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [myArticles, setMyArticles] = useState<UserArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [topDemandedItems, setTopDemandedItems] = useState<DemandAnalysisItem[]>([]);
  const [loadingTopDemanded, setLoadingTopDemanded] = useState(false);
  const [topDemandedError, setTopDemandedError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { unreadCount, addNotification } = useTrackingNotifications();
  const bellAnim = useRef(new Animated.Value(1)).current;
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setShowBadge(true);
      const t = setTimeout(() => setShowBadge(false), 4000); // deaparece tras 4 segundos
      return () => clearTimeout(t);
    }
  }, [unreadCount]);


  const headerAnim = useRef(new Animated.Value(0)).current;

  const statusLabel = (status?: DeliveryStatus | null) => {
    switch (status) {
      case "PICKED_UP": return "ha sido recogido por el repartidor";
      case "IN_TRANSIT": return "está en camino";
      case "NEARBY": return "está cerca del domicilio";
      case "DELIVERED": return "ha sido entregado";
      default: return "actualizado";
    }
  };

    
  const checkTrackingUpdates = async () => {
    if (!user?.id || !user?.token) return;
    if (user.role !== "USER") return;

    const userUpdatesKey = `${LAST_UPDATES_KEY}_${user.id}`;

    const stored = await AsyncStorage.getItem(userUpdatesKey);
    const lastUpdates: Record<string, string> = stored ? JSON.parse(stored) : {};

    const kits = await getUpdatrableTrackingKits(user.id, user.token);

    for (const kit of kits) {
      try {
        const tracking = await getKitTracking(kit.id, user.token);
        const lastUpdate = tracking.lastUpdate ?? "";
        const prevUpdate = lastUpdates[String(kit.id)] ?? "";

        if (lastUpdate && lastUpdate !== prevUpdate && tracking.status) {
          await addNotification({
            id: `${kit.id}-${tracking.status}`,
            kitId: kit.id,
            kitName: kit.name,
            status: tracking.status,
            message: `Tu kit "${kit.name}" ${statusLabel(tracking.status)}.`,
            createdAt: new Date().toISOString(),
            read: false,
          });
          lastUpdates[String(kit.id)] = lastUpdate;
        }
      } catch (error) {
        console.log("Error al obtener tracking:", error);
      }
    }

    await AsyncStorage.setItem(userUpdatesKey, JSON.stringify(lastUpdates));
  };

  const fetchData = async () => {
    if (!user?.id || !user?.token) return;
    setLoadingBalance(true);
    try {
      const wallet = await getLoggedUserWallet(user.token);
      setBalance(wallet.balance);
    } catch {
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
    setLoadingRentals(true);
    try {
      setRentedItems(await getRentedItems(user.id, user.token));
    } catch {
      setRentedItems([]);
    } finally {
      setLoadingRentals(false);
    }
    setLoadingArticles(true);
    try {
      setMyArticles(await getMyArticles(user.id, user.token));
    } catch {
      setMyArticles([]);
    } finally {
      setLoadingArticles(false);
    }

    setLoadingTopDemanded(true);
    try {
      const topItems = await getTopDemandedItems(user.token, 5);
      setTopDemandedItems(topItems);
      setTopDemandedError(null);
    } catch (error) {
      setTopDemandedItems([]);
      setTopDemandedError(error instanceof Error ? error.message : 'No se pudo cargar el análisis de demanda.');
    } finally {
      setLoadingTopDemanded(false);
    }

    await checkTrackingUpdates();
  };

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    fetchData()
  }, [user?.id, user?.token]);
  
  useFocusEffect(React.useCallback(() => { fetchData(); }, [user?.id, user?.token]));

  useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [unreadCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const activeRentals = rentedItems.filter(i => new Date(i.endDate) > new Date());

  // Función para obtener tamaños de fuente responsivos
  const getResponsiveFontSize = (mobile: number, tablet: number, desktop: number) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Función para determinar cuántas tarjetas mostrar en el grid
  const getGridColumns = () => {
    if (isMobile) return 1; // En móvil, 1 columna (stack vertical)
    if (isTablet) return 2; // En tablet, 2 columnas
    return 3; // En desktop, 3 columnas
  };

  const gridColumns = getGridColumns();
  const gridCardWidth = gridColumns === 1
    ? '100%'
    : gridColumns === 2
    ? '48%'
    : '32%';

  return (
    <SafeAreaView style={[styles.root, {paddingBottom: navbarOffset}]} edges={['top', 'left', 'right']}>
      <Helmet>
        <title>Inicio | KeaKit</title>
        <meta name="description" content="Panel principal de KeaKit para gestionar tus alquileres, kits, wallet y los artículos y servicios que hayas publicado."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Main scrollable container */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: isMobile ? 16 : isTablet ? 24 : 32 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryHome} />
        }
      >

        {/* Wallet - Tarjeta ancha */}
        <FadeInItem delay={50}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient
              colors={[Colors.primaryHome, '#1e526e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.card, 
                styles.cardPrimary, 
                styles.touchableCardLayout,
                { marginBottom: isMobile ? 16 : 20 }
              ]}
            >
              <View style={styles.walletContentWrapper}>
                <View style={styles.cardHeaderFlex}>
                  <Text style={[
                    styles.cardTitleLight,
                    { fontSize: getResponsiveFontSize(16, 18, 20) }
                  ]}>
                    Mi Wallet
                  </Text>
                  <View style={[styles.iconRingLight, { borderColor: Colors.backgroundWhite }]}>
                    <Ionicons name="wallet" size={isMobile ? 16 : 18} color="#FFFFFF" />
                  </View>
                </View>
                {loadingBalance ? (
                  <SkeletonPulse width={isMobile ? 100 : 120} height={isMobile ? 32 : 38} radius={8} dark />
                ) : (
                  <Text style={[
                    styles.hugeValueLight,
                    { fontSize: getResponsiveFontSize(28, 32, 36) }
                  ]}>
                    {balance !== null ? `${balance.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} €` : '0,00 €'}
                  </Text>
                )}
                <Text style={[
                  styles.cardSubtitleLight,
                  { fontSize: getResponsiveFontSize(12, 14, 14) }
                ]}>
                  Balance disponible
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={isMobile ? 20 : 24} 
                color={Colors.white} 
                style={styles.walletChevron} 
              />
            </LinearGradient>
          </TouchableOpacity>
        </FadeInItem>

        {/* Item rented now card - Versión mejorada */}
        {user && (
          <FadeInItem delay={150}>
            <TouchableOpacity 
              style={[
                styles.card, 
                styles.cardHorizontal, 
                { 
                  backgroundColor: Colors.secondaryLavender,
                  marginBottom: isMobile ? 16 : 20,
                  paddingVertical: isMobile ? 20 : 24,
                }
              ]} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyKits')}
            >
              <View style={[
                styles.largeCircleGraphic, 
                { 
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  width: isMobile ? 60 : 76,
                  height: isMobile ? 60 : 76,
                  borderRadius: isMobile ? 30 : 38,
                  marginRight: isMobile ? 12 : 16,
                }
              ]}>
                <Ionicons 
                  name="layers" 
                  size={isMobile ? 28 : 32} 
                  color={Colors.primaryHome} 
                />
              </View>
              <View style={styles.cardHorizontalText}>
                {loadingRentals ? (
                  <SkeletonPulse width={isMobile ? 40 : 60} height={isMobile ? 24 : 28} />
                ) : (
                  <Text style={[
                    styles.hugeValueDark,
                    { fontSize: getResponsiveFontSize(28, 32, 36) }
                  ]}>
                    {activeRentals.length}
                  </Text>
                )}
                <Text style={[
                  styles.cardSubtitleDark,
                  { fontSize: getResponsiveFontSize(12, 14, 14) }
                ]}>
                  Artículos en uso
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={isMobile ? 20 : 24} 
                color={Colors.primaryHome} 
              />
            </TouchableOpacity>
          </FadeInItem>
        )}

        {/* Create kit and upload Article Cards - Grid Responsive */}
        <FadeInItem delay={250}>
          <View style={[
            styles.gridContainer,
            { 
              flexDirection: gridColumns === 1 ? 'column' : 'row',
              flexWrap: gridColumns > 1 ? 'wrap' : 'nowrap',
              justifyContent: gridColumns === 1 ? 'center' : 'flex-start', // Cambiado a flex-start por si hay 4 tarjetas
              alignItems: 'stretch',
              marginBottom: isMobile ? 16 : 20,
              gap: isMobile ? 12 : 16, // Usamos gap genérico para simplificar el espaciado
            }
          ]}>
            
            {/* NUEVO: Catálogo de Kits Predeterminados */}
            <View style={[
              styles.gridCardWrapper,
              { width: gridCardWidth, maxWidth: gridCardWidth }
            ]}>
              <View style={[styles.card, styles.gridCard, { backgroundColor: '#E0F2FE' }]}>
                <View style={[
                  styles.circleGraphic, 
                  { 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    borderRadius: isMobile ? 25 : 30,
                  }
                ]}>
                  <Ionicons 
                    name="flash" 
                    size={isMobile ? 24 : 28} 
                    color={Colors.primaryHome} 
                  />
                </View>
                <View style={styles.gridCardContent}>
                  <Text style={[
                    styles.gridCardValueDark,
                    { fontSize: getResponsiveFontSize(18, 20, 22) }
                  ]}>
                    Kits Express
                  </Text>
                  <Text style={[
                    styles.gridCardLabelDark,
                    { fontSize: getResponsiveFontSize(11, 12, 12) }
                  ]}>
                    Listos para usar
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.pillButtonPrimary,
                    { paddingVertical: isMobile ? 8 : 10 }
                  ]} 
                  onPress={() => navigation.navigate('DefaultKits')}
                >
                  <Text style={[
                    styles.pillButtonTextLight,
                    { fontSize: getResponsiveFontSize(12, 14, 14) }
                  ]}>
                    Ver catálogo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Create kit card (Personalizado) */}
            <View style={[
              styles.gridCardWrapper,
              { width: gridCardWidth, maxWidth: gridCardWidth }
            ]}>
              <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryBlue }]}>
                <View style={[
                  styles.circleGraphic, 
                  { 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    borderRadius: isMobile ? 25 : 30,
                  }
                ]}>
                  <Ionicons 
                    name="cube" 
                    size={isMobile ? 24 : 28} 
                    color={Colors.primaryHome} 
                  />
                </View>
                <View style={styles.gridCardContent}>
                  <Text style={[
                    styles.gridCardValueDark,
                    { fontSize: getResponsiveFontSize(18, 20, 22) }
                  ]}>
                    Kit a medida
                  </Text>
                  <Text style={[
                    styles.gridCardLabelDark,
                    { fontSize: getResponsiveFontSize(11, 12, 12) }
                  ]}>
                    Crea el tuyo propio
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.pillButtonPrimary,
                    { paddingVertical: isMobile ? 8 : 10 }
                  ]} 
                  onPress={() => navigation.navigate('CreateKit')}
                >
                  <Text style={[
                    styles.pillButtonTextLight,
                    { fontSize: getResponsiveFontSize(12, 14, 14) }
                  ]}>
                    Crear desde cero
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upload Article card */}
            <View style={[
              styles.gridCardWrapper,
              { width: gridCardWidth, maxWidth: gridCardWidth }
            ]}>
              <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryMint }]}>
                <View style={[
                  styles.circleGraphic, 
                  { 
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    borderRadius: isMobile ? 25 : 30,
                  }
                ]}>
                  <Ionicons 
                    name="bag" 
                    size={isMobile ? 24 : 28} 
                    color={Colors.primaryHome} 
                  />
                </View>
                <View style={styles.gridCardContent}>
                  <Text style={[
                    styles.gridCardValueDark,
                    { fontSize: getResponsiveFontSize(18, 20, 22) }
                  ]}>
                    Artículo
                  </Text>
                  <Text style={[
                    styles.gridCardLabelDark,
                    { fontSize: getResponsiveFontSize(11, 12, 12) }
                  ]}>
                    Pon a alquilar tus objetos
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.pillButtonPrimary,
                    { paddingVertical: isMobile ? 8 : 10 }
                  ]} 
                  onPress={() => navigation.navigate('UploadArticle')}
                >
                  <Text style={[
                    styles.pillButtonTextLight,
                    { fontSize: getResponsiveFontSize(12, 14, 14) }
                  ]}>
                    Subir artículo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upload Service card - Solo para USER */}
            {user?.role === 'USER' && (
              <View style={[
                styles.gridCardWrapper,
                { width: gridCardWidth, maxWidth: gridCardWidth }
              ]}>
                <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryCoral }]}>
                  <View style={[
                    styles.circleGraphic, 
                    { 
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      width: isMobile ? 50 : 60,
                      height: isMobile ? 50 : 60,
                      borderRadius: isMobile ? 25 : 30,
                    }
                  ]}>
                    <Ionicons 
                      name="construct-outline" 
                      size={isMobile ? 24 : 28} 
                      color={Colors.primaryHome} 
                    />
                  </View>
                  <View style={styles.gridCardContent}>
                    <Text style={[
                      styles.gridCardValueDark,
                      { fontSize: getResponsiveFontSize(18, 20, 22) }
                    ]}>
                      Servicio
                    </Text>
                    <Text style={[
                      styles.gridCardLabelDark,
                      { fontSize: getResponsiveFontSize(11, 12, 12) }
                    ]}>
                      Ofrece servicios
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.pillButtonPrimary,
                      { paddingVertical: isMobile ? 8 : 10 }
                    ]} 
                    onPress={() => navigation.navigate('PromoteService')}
                  >
                    <Text style={[
                      styles.pillButtonTextLight,
                      { fontSize: getResponsiveFontSize(12, 14, 14) }
                    ]}>
                      Publicar servicio
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </FadeInItem>

        {/* Article list */}
        {user?.role === 'USER' && (
          <FadeInItem delay={320}>
            <View style={[
              styles.card,
              styles.cardWhite,
              Shadows.medium,
              { marginBottom: isMobile ? 16 : 20 }
            ]}>
              <View style={styles.topDemandedHeader}>
                <Text style={[
                  styles.cardTitleDark,
                  { fontSize: getResponsiveFontSize(16, 18, 18) }
                ]}>
                  Top productos demandados
                </Text>
                {!loadingTopDemanded && topDemandedItems.length > 0 && (
                  <Text style={styles.topDemandedHint}>últimos alquileres</Text>
                )}
              </View>

              <View style={styles.listContainer}>
                {loadingTopDemanded ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <CompactSkeletonRow key={`demand-skeleton-${i}`} isMobile={isMobile} />
                  ))
                ) : topDemandedError ? (
                  <View style={styles.topDemandedErrorBox}>
                    <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
                    <Text style={styles.topDemandedErrorText} numberOfLines={2}>
                      {topDemandedError}
                    </Text>
                    <TouchableOpacity onPress={fetchData} style={styles.topDemandedRetryBtn}>
                      <Text style={styles.topDemandedRetryText}>Reintentar</Text>
                    </TouchableOpacity>
                  </View>
                ) : topDemandedItems.length === 0 ? (
                  <EmptyTrayMessage icon="stats-chart-outline" message="Aún no hay datos de demanda disponibles" />
                ) : (
                  topDemandedItems.map((item, idx) => (
                    <TopDemandedRow
                      key={item.itemId}
                      item={item}
                      rank={idx + 1}
                      isLast={idx === topDemandedItems.length - 1}
                      isMobile={isMobile}
                    />
                  ))
                )}
              </View>
            </View>
          </FadeInItem>
        )}

        {user && (
          <FadeInItem delay={350}>
            <View style={[
              styles.card, 
              styles.cardWhite, 
              Shadows.medium,
              { marginBottom: isMobile ? 16 : 20 }
            ]}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 12 
              }}>
                <Text style={[
                  styles.cardTitleDark,
                  { fontSize: getResponsiveFontSize(16, 18, 18) }
                ]}>
                  Mis artículos publicados
                </Text>
                {!loadingArticles && myArticles.length > 0 && (
                  <TouchableOpacity onPress={() => navigation.navigate('MyArticles')}>
                    <Text style={styles.seeAllText}>Ver todos</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.listContainer}>
                {loadingArticles ? (
                  Array.from({ length: 3 }).map((_, i) => <CompactSkeletonRow key={i} isMobile={isMobile} />)
                ) : myArticles.length === 0 ? (
                  <EmptyTrayMessage icon="pricetags-outline" message="No tienes artículos publicados" />
                ) : (
                  myArticles.slice(0, 3).map((article, idx) => {
                    const cfg = STATUS_CONFIG[article.status] ?? STATUS_CONFIG.DEFAULT;
                    return (
                      <CompactRow
                        key={article.id}
                        isLast={idx === Math.min(myArticles.length, 3) - 1}
                        title={article.title}
                        subtitle={cfg.label}
                        price={`${article.pricePerMonth}€`}
                        dotColor={cfg.dot}
                        isMobile={isMobile}
                      />
                    );
                  })
                )}
              </View>
              
              {!loadingArticles && myArticles.length > 3 && (
                <TouchableOpacity 
                  style={[
                    styles.moreBtnPrimary,
                    { marginTop: 12 }
                  ]} 
                  onPress={() => navigation.navigate('MyArticles')}
                >
                  <Text style={[
                    styles.moreBtnTextLabelLight,
                    { fontSize: getResponsiveFontSize(13, 14, 14) }
                  ]}>
                    Ver todos los artículos →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </FadeInItem>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

// ─── Sub-components mejorados ──────────────────────────────────
const CompactRow: React.FC<{
  title: string;
  subtitle: string;
  price: string;
  dotColor: string;
  isLast?: boolean;
  isMobile: boolean;
}> = ({ title, subtitle, price, dotColor, isLast, isMobile }) => (
  <View style={[styles.compactRow, isLast && styles.compactRowLast]}>
    <View style={styles.compactRowLeft}>
      <Text 
        style={[
          styles.compactRowTitle,
          { fontSize: isMobile ? 14 : 15 }
        ]} 
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text 
        style={[
          styles.compactRowSubtitle,
          { fontSize: isMobile ? 12 : 13 }
        ]}
      >
        {subtitle}
      </Text>
    </View>
    <View style={styles.compactRowRight}>
      <Text 
        style={[
          styles.compactRowPrice,
          { fontSize: isMobile ? 14 : 15 }
        ]}
      >
        {price}
      </Text>
      <View style={[styles.compactRowDot, { backgroundColor: dotColor }]} />
    </View>
  </View>
);

const CompactSkeletonRow: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <View style={styles.compactRow}>
    <View style={styles.compactRowLeft}>
      <SkeletonPulse width="80%" height={isMobile ? 12 : 14} />
      <SkeletonPulse width="50%" height={isMobile ? 10 : 12} radius={4} />
    </View>
    <SkeletonPulse width={isMobile ? 35 : 40} height={isMobile ? 14 : 16} radius={6} />
  </View>
);

const TopDemandedRow: React.FC<{
  item: DemandAnalysisItem;
  rank: number;
  isLast?: boolean;
  isMobile: boolean;
}> = ({ item, rank, isLast, isMobile }) => (
  <View style={[styles.topDemandedRow, isLast && styles.topDemandedRowLast]}>
    <View style={styles.topDemandedRankBadge}>
      <Text style={styles.topDemandedRankText}>#{rank}</Text>
    </View>

    <View style={styles.topDemandedImageWrap}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.topDemandedImage} resizeMode="cover" />
      ) : (
        <Ionicons name="image-outline" size={18} color="#9CA3AF" />
      )}
    </View>

    <View style={styles.topDemandedInfo}>
      <Text
        style={[
          styles.topDemandedTitle,
          { fontSize: isMobile ? 13 : 14 }
        ]}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        style={[
          styles.topDemandedCategory,
          { fontSize: isMobile ? 11 : 12 }
        ]}
        numberOfLines={1}
      >
        {item.categoryName}
      </Text>
    </View>

    <View style={styles.topDemandedMetrics}>
      <Text style={[styles.topDemandedMetricValue, { fontSize: isMobile ? 13 : 14 }]}>
        {item.totalTimesRented}
      </Text>
      <Text style={[styles.topDemandedMetricLabel, { fontSize: isMobile ? 10 : 11 }]}>alquileres</Text>
      <Text style={[styles.topDemandedMetricSubLabel, { fontSize: isMobile ? 10 : 11 }]}>
        {item.totalUnitsRented} uds.
      </Text>
    </View>
  </View>
);

const EmptyTrayMessage: React.FC<{ icon: any; message: string }> = ({ icon, message }) => (
  <View style={styles.emptyTrayContent}>
    <Ionicons name={icon} size={32} color="#D1D5DB" />
    <Text style={styles.emptyTrayMessage}>{message}</Text>
  </View>
);

const Shadows = {
  medium: {
    shadowColor: '#2d6e91',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  headerGreeting: {
    fontWeight: '800',
    color: Colors.primaryHome,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellButton: {
    position: "relative",
    padding: 6,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff3b30",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  avatarBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryHome, // Círculo azul oscuro
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // Base Card
  card: {
    borderRadius: 16,
    padding: 20,
  },
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardPrimary: {},
  touchableCardLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletContentWrapper: {
    flex: 1,
  },
  walletChevron: {
    marginLeft: 12,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleLight: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  iconRingLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hugeValueLight: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 2,
  },
  cardSubtitleLight: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  hugeValueDark: {
    fontWeight: '800',
    color: Colors.primaryHome,
    letterSpacing: -1,
    marginBottom: 2,
  },
  cardTitleDark: {
    fontWeight: '800',
    color: Colors.primaryHome,
    letterSpacing: -0.3,
  },
  cardSubtitleDark: {
    color: Colors.textPrimaryHome,
    fontWeight: '500',
  },
  cardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeCircleGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHorizontalText: {
    flex: 1,
  },
  topDemandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topDemandedHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  topDemandedErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  topDemandedErrorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
  },
  topDemandedRetryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryHomeOpacity,
  },
  topDemandedRetryText: {
    color: Colors.primaryHome,
    fontWeight: '700',
    fontSize: 12,
  },
  topDemandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topDemandedRowLast: {
    borderBottomWidth: 0,
  },
  topDemandedRankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryHomeOpacity,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDemandedRankText: {
    color: Colors.primaryHome,
    fontWeight: '800',
    fontSize: 12,
  },
  topDemandedImageWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topDemandedImage: {
    width: '100%',
    height: '100%',
  },
  topDemandedInfo: {
    flex: 1,
    gap: 2,
  },
  topDemandedTitle: {
    color: Colors.primaryHome,
    fontWeight: '700',
  },
  topDemandedCategory: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  topDemandedMetrics: {
    alignItems: 'flex-end',
    minWidth: 68,
  },
  topDemandedMetricValue: {
    color: Colors.primaryHome,
    fontWeight: '800',
    lineHeight: 18,
  },
  topDemandedMetricLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
    lineHeight: 14,
  },
  topDemandedMetricSubLabel: {
    color: '#9CA3AF',
    fontWeight: '500',
    lineHeight: 14,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  gridCardWrapper: {
    marginBottom: 0,
  },
  gridCard: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
    height: '100%',
  },
  circleGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridCardContent: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 20,
  },
  gridCardValueDark: {
    fontWeight: '800',
    color: Colors.primaryHome,
    marginBottom: 2,
  },
  gridCardLabelDark: {
    color: Colors.textPrimaryHome,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  pillButtonPrimary: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primaryHome,
    alignItems: 'center',
  },
  pillButtonTextLight: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  compactRowLast: {
    borderBottomWidth: 0,
  },
  compactRowLeft: {
    flex: 1,
    gap: 4,
  },
  compactRowTitle: {
    fontWeight: '600',
    color: Colors.primaryHome,
  },
  compactRowSubtitle: {
    color: Colors.textPrimaryHome,
  },
  compactRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactRowPrice: {
    fontWeight: '800',
    color: Colors.primaryHome,
  },
  compactRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyTrayContent: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyTrayMessage: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  moreBtnPrimary: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primaryHome,
    alignItems: 'center',
  },
  moreBtnTextLabelLight: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    color: Colors.primaryHome,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
