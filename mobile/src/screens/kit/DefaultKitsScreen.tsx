import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KitResponse, KitStatus, RootStackParamList } from "../../types";
import { Colors } from "../../styles";
import { defaultKitStyles } from "../../styles/defaultKitStyles";
import { getAllKits } from "../../services/kitService";

type DefaultKitsNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKits"
>;

const DefaultKitsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DefaultKitsNav>();

  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDefaultKits = useCallback(async () => {
    if (!user?.token) {
      setError("Necesitas iniciar sesión para ver los kits.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAllKits(user.token);
      const filtered = data.filter(
        (kit: KitResponse) =>
          kit.status === KitStatus.DRAFT && kit.tenantId !== user.id,
      );
      setKits(filtered);
    } catch (err) {
      console.error("Error loading default kits:", err);
      setError("No se pudieron cargar los kits predeterminados.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    loadDefaultKits();
  }, [loadDefaultKits]);

  useFocusEffect(
    useCallback(() => {
      loadDefaultKits();
    }, [loadDefaultKits]),
  );

  const renderKit = ({ item }: { item: KitResponse }) => (
    <TouchableOpacity
      style={defaultKitStyles.card}
      onPress={() => navigation.navigate("EditDefaultKit", { kitId: item.id })}
      activeOpacity={0.8}
    >
      <Text style={defaultKitStyles.cardTitle} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={defaultKitStyles.cardSubtitle}>
        {item.city}, {item.country}
      </Text>

      <View style={defaultKitStyles.cardRow}>
        <View style={defaultKitStyles.badge}>
          <Text style={defaultKitStyles.badgeText}>
            {item.totalSelectedItems ?? item.items?.length ?? 0} productos
          </Text>
        </View>
        <TouchableOpacity
          style={defaultKitStyles.primaryButton}
          onPress={() => navigation.navigate("EditDefaultKit", { kitId: item.id })}
        >
          <Text style={defaultKitStyles.primaryButtonText}>Personalizar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={defaultKitStyles.screen}>
      <View style={defaultKitStyles.header}>
        <TouchableOpacity
          style={defaultKitStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryHome} />
        </TouchableOpacity>
        <Text style={defaultKitStyles.headerTitle}>Kits predeterminados</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={defaultKitStyles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primaryHome} />
          <Text style={defaultKitStyles.helperText}>Cargando kits...</Text>
        </View>
      ) : error ? (
        <View style={defaultKitStyles.emptyState}>
          <Ionicons
            name="alert-circle-outline"
            size={54}
            color={Colors.primaryHome}
          />
          <Text style={defaultKitStyles.emptyTitle}>Ups</Text>
          <Text style={defaultKitStyles.emptySubtitle}>{error}</Text>
        </View>
      ) : kits.length === 0 ? (
        <View style={defaultKitStyles.emptyState}>
          <Ionicons name="cube-outline" size={54} color={Colors.primaryHome} />
          <Text style={defaultKitStyles.emptyTitle}>Sin kits todavía</Text>
          <Text style={defaultKitStyles.emptySubtitle}>
            En cuanto estén disponibles, podrás personalizarlos aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKit}
          contentContainerStyle={defaultKitStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default DefaultKitsScreen;
