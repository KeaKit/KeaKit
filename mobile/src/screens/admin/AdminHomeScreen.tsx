import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../styles';
import { Helmet } from 'react-helmet-async';

type AdminHomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ─── Paleta KeaKit MIC ────────────────────────────────────────────────────────
const KC = {
  cream:     '#fcfff5',
  blue:      '#2d6e91',
  blueDark:  '#1e526e',
  gray:      '#595959',
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

// ─── Definición de secciones del panel ───────────────────────────────────────
type AdminSection = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  color: string;
  implemented: boolean;
  screen?: keyof RootStackParamList;
};

const ADMIN_SECTIONS: AdminSection[] = [
{
    id: 'users',
    icon: 'people',
    label: 'Gestión de Usuarios',
    description: 'Crear, editar y eliminar cuentas',
    color: KC.blue,
    implemented: true,
    screen: 'AdminUsers',
  },
  {
    id: 'couriers',
    icon: 'navigate',
    label: 'Gestión de repartidores',
    description: 'Asignar kits a repartidores',
    color: KC.mint,
    implemented: true,
    screen: 'Couriers',
  },
  {
    id: 'categories',
    icon: 'folder-open',
    label: 'Categorías',
    description: 'Crear, editar y eliminar categorías',
    color: KC.skyBlue,
    implemented: true,
    screen: 'Categories',
  },
  {
    id: 'commission',
    icon: 'cash',
    label: 'Comisión de Plataforma',
    description: 'Configurar el % de comisión por alquiler',
    color: KC.lightBlue,
    implemented: true,
    screen: 'Commission',
  },
  {
    id: 'incidents',
    icon: 'warning',
    label: 'Gestión de Incidencias',
    description: 'Mediar en conflictos entre usuarios',
    color: '#e67e22',
    implemented: true,
    screen: 'AdminIncidents',
  },
  {
    id: 'default-kits',
    icon: 'cube',
    label: 'Gestión de kits Predeterminados',
    description: 'Crear, editar y eliminar kits predeterminados',
    color: KC.blueDark,
    implemented: true,
    screen: 'DefaultKits',
  },
  {
    id: 'privacy-policy',
    icon: 'document-text',
    label: 'Política de Privacidad',
    description: 'Editar la política y gestionar versiones',
    color: KC.lavender,
    implemented: true,
    screen: 'EditPolicy',
  },
  {
    id: 'pilot-users',
    icon: 'rocket',
    label: 'Usuarios Piloto',
    description: 'Gestionar emails de usuarios piloto',
    color: KC.lavender,
    implemented: true,
    screen: 'PilotUsers',
  },
  {
    id: 'promo-codes',
    icon: 'pricetag',
    label: 'Códigos Promocionales',
    description: 'Gestionar descuentos y usuarios piloto',
    color: KC.mint,
    implemented: true,
    screen: 'PromoCodes',
  },
  {
    id: 'stats',
    icon: 'bar-chart',
    label: 'Estadísticas',
    description: 'Métricas y datos de uso de la plataforma',
    color: KC.lightMint,
    implemented: false,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<AdminHomeNav>();

  const handleSectionPress = (section: AdminSection) => {
    if (section.implemented && section.screen) {
      navigation.navigate(section.screen as any);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      
      <Helmet>
        <title>Panel de Administración | KeaKit</title>
        <meta name="description" content="Panel de administración de KeaKit. Gestión de usuarios, kits, categorías, repartidores y configuración de la plataforma." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header dentro del ScrollView ───────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSuperTitle}>Panel de administración</Text>
            <Text style={styles.headerTitle}>Hola, {firstName}</Text>
          </View>
          <View style={{ width: 44 }} /> {/* Espaciador para mantener el diseño */}
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
              <Text style={styles.bannerRole}>Administrador</Text>
              <Text style={styles.bannerSub}>Acceso completo a la plataforma</Text>
            </View>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="shield-checkmark" size={48} color="rgba(255,255,255,0.25)" />
            </View>
          </LinearGradient>
        </FadeIn>

        {/* ── Título de secciones ──────────────────────────────────────── */}
        <FadeIn delay={130}>
          <Text style={styles.sectionTitle}>Gestión de la plataforma</Text>
        </FadeIn>

        {/* ── Grid de funcionalidades ──────────────────────────────────── */}
        <View style={styles.grid}>
          {ADMIN_SECTIONS.map((section, idx) => (
            <FadeIn key={section.id} delay={180 + idx * 60}>
              <AdminCard section={section} onPress={() => handleSectionPress(section)} />
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── AdminCard ────────────────────────────────────────────────────────────────
const AdminCard: React.FC<{ section: AdminSection; onPress: () => void }> = ({ section, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  const bgColor = section.implemented
    ? section.color
    : '#f0f0f0';

  const iconColor = section.implemented ? KC.white : '#aaa';
  const labelColor = section.implemented ? (
    [KC.lavender, KC.mint, KC.lightBlue, KC.lightMint].includes(section.color) ? KC.gray : KC.white
  ) : '#aaa';

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
          <Ionicons name={section.icon} size={24} color={iconColor} />
        </View>
        <Text style={[styles.cardLabel, { color: labelColor }]}>{section.label}</Text>
        <Text style={[styles.cardDesc,  { color: section.implemented ? 'rgba(0,0,0,0.45)' : '#bbb' }]}>
          {section.description}
        </Text>
        {section.implemented ? (
          <View style={styles.cardArrow}>
            <Ionicons name="arrow-forward" size={16} color={labelColor} />
          </View>
        ) : (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Próximamente</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: KC.gray,
    letterSpacing: 0.2,
    paddingHorizontal: 2,
    marginBottom: 16,
  },
  grid: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 0.3,
  },
});

export default AdminHomeScreen;