import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RentedItemResponse, Article, DeliveryStatus, KitResponse } from '../../types';
import { Colors } from '../../styles';
import { getLoggedUserWallet, getRentedItems,getMyArticles } from '../../services';
import { SkeletonPulse, FadeInItem } from '../../components';
import ProfileMenuModal from './ProfileMenuModal';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTrackingNotifications } from "../../context/TrackingNotificationContext";
import { getMyKits, getKitTracking } from "../../services/kitService";

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;


// Status ENUM for item status
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  AVAILABLE: { label: 'Available', dot: '#10B981' }, 
  RENTED:    { label: 'Rented',  dot: '#F59E0B' }, 
  DEFAULT:   { label: 'Inactive',   dot: '#9CA3AF' }, 
};

const LAST_UPDATES_KEY = "@tracking_last_updates";

// Main Component
const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HomeNav>();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [rentedItems, setRentedItems] = useState<RentedItemResponse[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { unreadCount, addNotification } = useTrackingNotifications();
  const bellAnim = useRef(new Animated.Value(1)).current;

  const headerAnim = useRef(new Animated.Value(0)).current;

  const statusLabel = (status?: DeliveryStatus | null) => {
    switch (status) {
      case "PICKED_UP": return "Kit recogido por repartidor";
      case "IN_TRANSIT": return "En camino";
      case "NEARBY": return "Cerca del domicilio";
      case "DELIVERED": return "Entregado al arrendatario";
      default: return "Actualizado";
    }
  };

    
  const checkTrackingUpdates = async () => {
    if (!user?.id || !user?.token) return;
    if (user.role !== "USER") return;

    const stored = await AsyncStorage.getItem(LAST_UPDATES_KEY);
    const lastUpdates: Record<string, string> = stored ? JSON.parse(stored) : {};

    const kits = await getMyKits(user.id, user.token);

    for (const kit of kits) {
      try {
        const tracking = await getKitTracking(kit.id, user.token);
        const lastUpdate = tracking.lastUpdate ?? "";
        const prevUpdate = lastUpdates[String(kit.id)] ?? "";

        if (lastUpdate && lastUpdate !== prevUpdate && tracking.status) {
          await addNotification({
            id: `${kit.id}-${lastUpdate}`,
            kitId: kit.id,
            kitName: kit.name,
            status: tracking.status,
            message: `Tu kit "${kit.name}" está ${statusLabel(tracking.status)}.`,
            createdAt: new Date().toISOString(),
            read: false,
          });
          lastUpdates[String(kit.id)] = lastUpdate;
        }
      } catch {
      }
    }

    await AsyncStorage.setItem(LAST_UPDATES_KEY, JSON.stringify(lastUpdates));
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

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
          },
        ]}
      >
        <Text style={styles.headerGreeting}>Hola, {user ? user.name.split(' ')[0] : 'Invitado'}</Text>
        
        
        {/* Campana + perfil */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate("TrackingNotifications")}
          >
            <Animated.View style={{ transform: [{ scale: bellAnim }] }}>
              <Ionicons name="notifications" size={22} color={Colors.primaryHome} />
            </Animated.View>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => setShowProfileMenu(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarIconWrap}>
              <Ionicons name="person" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main scrollable container */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryHome} />
        }
      >
        { /* Wallet */}
        <FadeInItem delay={50}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient
              colors={[Colors.primaryHome, '#1e526e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, styles.cardPrimary, styles.touchableCardLayout]}
            >
              <View style={styles.walletContentWrapper}>
                <View style={styles.cardHeaderFlex}>
                  <Text style={styles.cardTitleLight}>Mi Wallet</Text>
                  <View style={[styles.iconRingLight, { borderColor: Colors.backgroundWhite }]}>
                    <Ionicons name="wallet" size={18} color="#FFFFFF" />
                  </View>
                </View>
                {loadingBalance ? (
                  <SkeletonPulse width={120} height={38} radius={8} dark />
                ) : (
                  <Text style={styles.hugeValueLight}>
                    {balance !== null ? `${balance.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} €` : '0,00 €'}
                  </Text>
                )}
                <Text style={styles.cardSubtitleLight}>balance disponible</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.white} style={styles.walletChevron} />
            </LinearGradient>
          </TouchableOpacity>
        </FadeInItem>

        {/* Item rented now card */}
        {user && (
          <FadeInItem delay={150}>
            <TouchableOpacity 
              style={[styles.card, styles.cardHorizontal, { backgroundColor: Colors.secondaryLavender }]} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyKits')}
            >
              <View style={[styles.largeCircleGraphic, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <Ionicons name="layers" size={32} color={Colors.primaryHome} />
              </View>
              <View style={styles.cardHorizontalText}>
                  {loadingRentals ? (
                  <SkeletonPulse width={60} height={28} />
                ) : (
                  <Text style={styles.hugeValueDark}>{activeRentals.length}</Text>
                )}
                <Text style={styles.cardSubtitleDark}>artículos en uso</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.primaryHome} />
            </TouchableOpacity>
          </FadeInItem>
        )}

        {/* Create kit and upload Article Cards */}
        <FadeInItem delay={250}>
          <View style={styles.gridRow}>
            {/* Create kit card */}
            <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryBlue }]}>
              <View style={[styles.circleGraphic, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <Ionicons name="cube" size={28} color={Colors.primaryHome} />
              </View>
              <View style={styles.gridCardContent}>
                <Text style={styles.gridCardValueDark}>Kit</Text>
                <Text style={styles.gridCardLabelDark}>Alquila tu propio kit</Text>
              </View>
              <TouchableOpacity 
                style={styles.pillButtonPrimary} 
                onPress={() => navigation.navigate('CreateKit')}
              >
                <Text style={styles.pillButtonTextLight}>Crear kit</Text>
              </TouchableOpacity>
            </View>

            {/* Upload Article card */}
            <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryMint }]}>
              <View style={[styles.circleGraphic, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <Ionicons name="bag" size={28} color={Colors.primaryHome} />
              </View>
              <View style={styles.gridCardContent}>
                <Text style={styles.gridCardValueDark}>Artículo</Text>
                <Text style={styles.gridCardLabelDark}>Pon a alquilar tus objetos</Text>
              </View>
              <TouchableOpacity 
                style={styles.pillButtonPrimary} 
                onPress={() => navigation.navigate('UploadArticle')}
              >
                <Text style={styles.pillButtonTextLight}>Subir artículo</Text>
              </TouchableOpacity>
            </View>

            {/* Upload Service card */}
            {user?.role === 'USER' && (
            <View style={[styles.card, styles.gridCard, { backgroundColor: Colors.secondaryCoral }]}>
              <View style={[styles.circleGraphic, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <Ionicons name="construct-outline" size={28} color={Colors.primaryHome} />
              </View>
              <View style={styles.gridCardContent}>
                <Text style={styles.gridCardValueDark}>Servicio</Text>
                <Text style={styles.gridCardLabelDark}>Ofrece servicios</Text>
              </View>
              <TouchableOpacity 
                style={styles.pillButtonPrimary} 
                onPress={() => navigation.navigate('PromoteService')}
              >
                <Text style={styles.pillButtonTextLight}>Publicar servicio</Text>
              </TouchableOpacity>
            </View>
            )}
          </View>
        </FadeInItem>

        {/* Article list */}
        {user && (
          <FadeInItem delay={350}>
            <View style={[styles.card, styles.cardWhite, Shadows.medium]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Text style={styles.cardTitleDark}>Mis artículos publicados</Text>
              </View>
              <View style={styles.listContainer}>
                {loadingArticles
                  ? Array.from({ length: 3 }).map((_, i) => <CompactSkeletonRow key={i} />)
                  : myArticles.length === 0
                  ? <EmptyTrayMessage icon="pricetags-outline" message="No tienes artículos publicados" />
                  : myArticles.slice(0, 3).map((article, idx) => {
                      const cfg = STATUS_CONFIG[article.status] ?? STATUS_CONFIG.DEFAULT;
                      return (
                        <CompactRow
                          key={article.id}
                          isLast={idx === Math.min(myArticles.length, 3) - 1}
                          title={article.title}
                          subtitle={cfg.label}
                          price={`${article.pricePerMonth}€`}
                          dotColor={cfg.dot}
                        />
                      );
                    })}
              </View>
              
              {!loadingArticles && myArticles.length > 3 && (
                <TouchableOpacity style={styles.moreBtnPrimary} onPress={() => navigation.navigate('MyArticles')}>
                  <Text style={styles.moreBtnTextLabelLight}>Ver todos los artículos →</Text>
                </TouchableOpacity>
              )}
            </View>
          </FadeInItem>
        )}

      </ScrollView>

      <ProfileMenuModal visible={showProfileMenu} onClose={() => setShowProfileMenu(false)} />
    </SafeAreaView>
  );
};

// ─── Sub-components para las listas internas ──────────────────────────────────

const CompactRow: React.FC<{
  title: string;
  subtitle: string;
  price: string;
  dotColor: string;
  isLast?: boolean;
}> = ({ title, subtitle, price, dotColor, isLast }) => (
  <View style={[styles.compactRow, isLast && styles.compactRowLast]}>
    <View style={styles.compactRowLeft}>
      <Text style={styles.compactRowTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.compactRowSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.compactRowRight}>
      <Text style={styles.compactRowPrice}>{price}</Text>
      <View style={[styles.compactRowDot, { backgroundColor: dotColor }]} />
    </View>
  </View>
);

const CompactSkeletonRow: React.FC = () => (
  <View style={styles.compactRow}>
    <View style={styles.compactRowLeft}>
      <SkeletonPulse width="80%" height={14} />
      <SkeletonPulse width="50%" height={12} radius={4} />
    </View>
    <SkeletonPulse width={40} height={16} radius={6} />
  </View>
);

const EmptyTrayMessage: React.FC<{ icon: any; message: string }> = ({ icon, message }) => (
  <View style={styles.emptyTrayContent}>
    <Ionicons name={icon} size={32} color="#D1D5DB" />
    <Text style={styles.emptyTrayMessage}>{message}</Text>
  </View>
);

// ─── Sombreado genérico (Shadows) ───────────────────────────────────────────────────────────
const Shadows = {
  medium: {
    shadowColor: '#2d6e91',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Fondo principal BLANCO puro
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerGreeting: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primaryHome, // Texto azul oscuro
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

  // Tarjeta Blanca (Mis Artículos)
  cardWhite: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)', // Borde casi invisible para definición
  },

  // Tarjeta Primaria Oscura (Wallet)
  cardPrimary: {
    // Gradiente aplicado en el componente
  },

  // Layouts específicos para la tarjeta Wallet pulsable
  touchableCardLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletContentWrapper: {
    flex: 1, // Ocupa todo el espacio para empujar la flecha a la derecha
  },
  walletChevron: {
    marginLeft: 12, // Espacio entre el texto y la flecha
  },

  // Contenidos de Cards OSCURAS (Wallet)
  cardHeaderFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleLight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF', // Texto blanco
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
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF', // Texto blanco
    letterSpacing: -1,
    marginBottom: 2,
  },
  cardSubtitleLight: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)', // Texto blanco con opacidad
    fontWeight: '500',
  },

  // Contenidos de Cards CLARAS (Alquileres / Grid / Lista)
  hugeValueDark: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primaryHome, // Texto azul oscuro
    letterSpacing: -1,
    marginBottom: 2,
  },
  cardTitleDark: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryHome,
    letterSpacing: -0.3,
  },
  cardSubtitleDark: {
    fontSize: 14,
    color: Colors.textPrimaryHome, // Texto gris oscuro
    fontWeight: '500',
  },

  // Contenidos de Card 2 (Alquileres Horizontal)
  cardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  largeCircleGraphic: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHorizontalText: {
    flex: 1,
  },

  // Grid 50/50 (Acciones)
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  circleGraphic: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryHome,
    marginBottom: 2,
  },
  gridCardLabelDark: {
    fontSize: 12,
    color: Colors.textPrimaryHome,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  pillButtonPrimary: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 999, // Botón pastilla relleno
    backgroundColor: Colors.primaryHome, // Botón azul oscuro
    alignItems: 'center',
  },
  pillButtonTextLight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // Texto blanco
  },

  // Card 5 (Lista interna)
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
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primaryHome,
  },
  compactRowSubtitle: {
    fontSize: 13,
    color: Colors.textPrimaryHome,
  },
  compactRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactRowPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryHome,
  },
  compactRowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Empty y More
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
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primaryHome, // Botón azul oscuro ancho
    alignItems: 'center',
  },
  moreBtnTextLabelLight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF', // Texto blanco
  },
});

export default HomeScreen;