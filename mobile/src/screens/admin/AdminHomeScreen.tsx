import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { BorderRadius, Colors, Shadows } from "../../styles";
import { useNavbarOffset } from "../../hooks/useWindowDimensions";
import { Helmet } from "react-helmet-async";
import { FadeInItem } from "../../components/FadeInItem";

type AdminHomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;
type ColorValue = (typeof Colors)[keyof typeof Colors];

const LIGHT_COLORS = [
  Colors.lavender,
  Colors.mint,
  Colors.lightBlue,
  Colors.lightMint,
  Colors.secondaryCoral,
  Colors.skyBlue,
] as const;
type LightColorValue = (typeof LIGHT_COLORS)[number];

// ─── Definición de secciones del panel ───────────────────────────────────────
type AdminSection = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description: string;
  color: ColorValue;
  implemented: boolean;
  screen?: keyof RootStackParamList;
};

const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "users",
    icon: "people",
    label: "Gestión de Usuarios",
    description: "Crear, editar y eliminar cuentas",
    color: Colors.lavender,
    implemented: true,
    screen: "AdminUsers",
  },
  {
    id: "couriers",
    icon: "navigate",
    label: "Gestión de repartidores",
    description: "Asignar kits a repartidores",
    color: Colors.mint,
    implemented: true,
    screen: "Couriers",
  },
  {
    id: "categories",
    icon: "folder-open",
    label: "Categorías",
    description: "Crear, editar y eliminar categorías",
    color: Colors.skyBlue,
    implemented: true,
    screen: "Categories",
  },
  {
    id: "commission",
    icon: "cash",
    label: "Comisión de Plataforma",
    description: "Configurar el % de comisión por alquiler",
    color: Colors.mint,
    implemented: true,
    screen: "Commission",
  },
  {
    id: "incidents",
    icon: "warning",
    label: "Gestión de Incidencias",
    description: "Mediar en conflictos entre usuarios",
    color: Colors.secondaryCoral,
    implemented: true,
    screen: "AdminIncidents",
  },
  {
    id: "default-kits",
    icon: "cube",
    label: "Gestión de kits Predeterminados",
    description: "Crear, editar y eliminar kits predeterminados",
    color: Colors.lavender,
    implemented: true,
    screen: "DefaultKits",
  },
  {
    id: "privacy-policy",
    icon: "document-text",
    label: "Política de Privacidad",
    description: "Editar la política y gestionar versiones",
    color: Colors.skyBlue,
    implemented: true,
    screen: "EditPolicy",
  },
  {
    id: "pilot-users",
    icon: "rocket",
    label: "Usuarios Piloto",
    description: "Gestionar emails de usuarios piloto",
    color: Colors.lavender,
    implemented: true,
    screen: "PilotUsers",
  },
  {
    id: "promo-codes",
    icon: "pricetag",
    label: "Códigos Promocionales",
    description: "Gestionar descuentos y usuarios piloto",
    color: Colors.mint,
    implemented: true,
    screen: "PromoCodes",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<AdminHomeNav>();
  const navbarOffset = useNavbarOffset();

  const handleSectionPress = (section: AdminSection) => {
    if (section.implemented && section.screen) {
      navigation.navigate(section.screen as any);
    }
  };

  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  return (
    <SafeAreaView
      style={[styles.root, { paddingBottom: navbarOffset }]}
      edges={["top", "left", "right"]}
    >
      <Helmet>
        <title>Panel de Administración | KeaKit</title>
        <meta
          name="description"
          content="Panel de administración de KeaKit. Gestión de usuarios, kits, categorías, repartidores y configuración de la plataforma."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header dentro del ScrollView ───────────────────────────────── */}

        <LinearGradient
          colors={[Colors.blue, Colors.blueDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.headerSuperTitle}>Panel de administración</Text>
            <Text style={styles.headerTitle}>Hola, {firstName}</Text>
          </View>

          <View>
            <Ionicons
              name="shield-checkmark"
              size={48}
              color="rgba(255,255,255,0.25)"
            />
          </View>
        </LinearGradient>

        {/* ── Grid de funcionalidades ──────────────────────────────────── */}
        <View style={styles.grid}>
          {ADMIN_SECTIONS.map((section, idx) => (
            <FadeInItem key={section.id} delay={180 + idx * 60}>
              <AdminCard
                section={section}
                onPress={() => handleSectionPress(section)}
              />
            </FadeInItem>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── AdminCard ────────────────────────────────────────────────────────────────
const AdminCard: React.FC<{ section: AdminSection; onPress: () => void }> = ({
  section,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const bgColor = section.implemented ? section.color : "#f0f0f0";

  const iconColor = section.implemented ? Colors.blue : "#aaa";
  const isLightColor = (color: ColorValue): color is LightColorValue =>
    LIGHT_COLORS.includes(color as LightColorValue);
  const labelColor = section.implemented
    ? isLightColor(section.color)
      ? Colors.blue
      : Colors.white
    : "#aaa";
  const descriptionColor = section.implemented
    ? isLightColor(section.color)
      ? Colors.gray
      : Colors.white
    : "#aaa";

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.cardIconWrap, { backgroundColor: Colors.white }]}>
          <Ionicons name={section.icon} size={28} color={iconColor} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardLabel, { color: labelColor }]}>
            {section.label}
          </Text>
          <Text style={[styles.cardDesc, { color: descriptionColor }]}>
            {section.description}
          </Text>
        </View>
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
    backgroundColor: Colors.cream,
  },
  scroll: {
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 22,
    ...Shadows.header,
    marginBottom: 16,
  },
  headerSuperTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIconWrap: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  cardArrow: {
    marginLeft: 8,
  },
  comingSoonBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 0.3,
  },
});

export default AdminHomeScreen;
