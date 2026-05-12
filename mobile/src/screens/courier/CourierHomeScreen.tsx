import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { getLoggedUserWallet } from '../../services';
import { SkeletonPulse } from '../../components';
import { Colors } from '../../styles/theme';
import { useNavbarOffset } from '../../hooks/useWindowDimensions';
import { Helmet } from 'react-helmet-async'; 

type CourierHomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ─── Paleta KeaKit MIC ────────────────────────────────────────────────────────
const KC = {
  cream:     '#fcfff5',
  blue:      '#2d6e91',
  blueDark:  '#1e526e',
  gray:      '#595959', // Este es el gris que usaremos para no cargar tanto de azul
  lavender:  '#d6d0f8',
  skyBlue:   '#8ec2db',
  mint:      '#c3f1d1',
  lightBlue: '#e4f1fc',
  lightMint: '#e5ffee',
  white:     '#FFFFFF',
};

// ─── Animated fade-in wrapper ─────────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CourierHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CourierHomeNav>();
  const navbarOffset = useNavbarOffset();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Cargar el Wallet del Courier
  const fetchWallet = async () => {
    if (!user?.token) return;
    setLoadingBalance(true);
    try {
      const wallet = await getLoggedUserWallet(user.token);
      setBalance(wallet.balance);
    } catch {
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  useFocusEffect(React.useCallback(() => { fetchWallet(); }, [user?.token]));

  const firstName = user?.name?.split(' ')[0] ?? 'Repartidor';

  return (
    <SafeAreaView style={[styles.root, {paddingBottom: navbarOffset}]} edges={['top', 'left', 'right']}>
      <Helmet>
        <title>Panel de Repartidor | KeaKit</title>
        <meta name="description" content="Panel de gestión de logística y transporte para repartidores de KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabecera con acceso directo a Kits Asignados ──────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSuperTitle}>Panel de repartidor</Text>
            <Text style={styles.headerTitle}>Hola, {firstName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('AssignedKits')}
          >
            <Ionicons name="cube" size={24} color={KC.blue} />
          </TouchableOpacity>
        </View>

        {/* ── Banner superior ──────────────────────────────────────────── */}
        <FadeIn delay={60}>
          <LinearGradient
            colors={[KC.blue, KC.blueDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerLabel}>Rol activo</Text>
              <Text style={styles.bannerRole}>Courier</Text>
              <Text style={styles.bannerSub}>Gestión de logística y transporte</Text>
            </View>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="bicycle" size={48} color="rgba(255,255,255,0.25)" />
            </View>
          </LinearGradient>
        </FadeIn>

        {/* ── Wallet Card ──────────────────────────────────────────────── */}
        <FadeIn delay={120}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient
              colors={[KC.blue, KC.blueDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.walletCard, 
                { marginBottom: isMobile ? 16 : 20 }
              ]}
            >
              <View style={styles.walletContentWrapper}>
                <View style={styles.walletHeaderFlex}>
                  <Text style={styles.walletTitle}>Mi Wallet</Text>
                  <View style={styles.walletIconRing}>
                    <Ionicons name="wallet" size={16} color={KC.white} />
                  </View>
                </View>
                {loadingBalance ? (
                  <SkeletonPulse width={100} height={32} radius={8} dark />
                ) : (
                  <Text style={styles.walletBalance}>
                    {balance !== null ? `${balance.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} €` : '0,00 €'}
                  </Text>
                )}
                <Text style={styles.walletSubtitle}>balance disponible</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={KC.white} 
                style={styles.walletChevron} 
              />
            </LinearGradient>
          </TouchableOpacity>
        </FadeIn>

        {/* ── Tarjeta principal de Tareas (Kits Asignados) ─────────────── */}
        <FadeIn delay={180}>
          <Text style={styles.sectionTitle}>Tus tareas</Text>
          <TouchableOpacity 
            style={styles.assignedKitsCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AssignedKits')}
          >
            <View style={styles.assignedKitsIconWrap}>
              <Ionicons name="cube" size={28} color={KC.white} />
            </View>
            <View style={styles.assignedKitsTextWrap}>
              <Text style={styles.assignedKitsTitle}>Kits Asignados</Text>
              <Text style={styles.assignedKitsDesc}>Gestiona tus recogidas y entregas pendientes</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={KC.white} />
          </TouchableOpacity>
        </FadeIn>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: KC.cream,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: KC.cream,
  },
  headerSuperTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: KC.blue,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: KC.blue,
    letterSpacing: -0.5,
  },
  headerActionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: KC.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    borderRadius: 18,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bannerRole: {
    fontSize: 26,
    fontWeight: '800',
    color: KC.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  bannerIconWrap: {
    marginLeft: 12,
  },
  
  // Wallet Styles
  walletCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletContentWrapper: {
    flex: 1,
  },
  walletHeaderFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: KC.white,
    letterSpacing: -0.3,
  },
  walletIconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: KC.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: '800',
    color: KC.white,
    letterSpacing: -1,
    marginBottom: 2,
  },
  walletSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  walletChevron: {
    marginLeft: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KC.gray,
    letterSpacing: 0.2,
    paddingHorizontal: 2,
    marginBottom: 12,
  },

  // Assigned Kits Card Styles (Actualizados)
  assignedKitsCard: {
    backgroundColor: Colors.secondaryBlue , // Fondo gris oscuro para romper el azul y que resalte el blanco
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assignedKitsIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.secondaryBlue , // Fondo sutil blanco para el icono
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  assignedKitsTextWrap: {
    flex: 1,
  },
  assignedKitsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: KC.white, // Título en blanco
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  assignedKitsDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)', // Letras pequeñas en blanco ligeramente suave
    lineHeight: 18,
  },
});

export default CourierHomeScreen;