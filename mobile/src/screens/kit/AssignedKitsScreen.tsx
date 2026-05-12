import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KitResponse, KitStatus, RootStackParamList } from "../../types";
import { Colors, Spacing, commonStyles } from "../../styles";
import { getAssignedKits } from "../../services/kitService";
import { Helmet } from 'react-helmet-async'; 


type AssignedKitsNav = NativeStackNavigationProp<RootStackParamList, "AssignedKits">;

const AssignedKitsScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const navigation = useNavigation<AssignedKitsNav>();

  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKits = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getAssignedKits(user.token);
      setKits(data.filter((k) => k.status !== KitStatus.CANCELLED));
    } catch (err) {
      setError("Error al cargar kits asignados");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const getDeliveryNotificationText = (item: KitResponse) => {
    if (!item.deliveryNotification) return null;
    if (item.status === KitStatus.FINISHED || item.status === KitStatus.CANCELLED || item.status === KitStatus.DRAFT) {
      return null;
    }
    if (item.status === KitStatus.ACTIVE) {
      return 'En uso';
    }
    return item.deliveryNotification;
  };

  useEffect(() => {
    if (!authLoading) loadKits();
  }, [authLoading, loadKits]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading) loadKits();
    }, [authLoading, loadKits]),
  );

  const renderKit = ({ item }: { item: KitResponse }) => (
    <TouchableOpacity
      style={styles.kitCard}
      onPress={() => navigation.navigate("KitDetail", { kitId: item.id })}
    >
      <View style={styles.imageContainer}>
        <View style={styles.kitImagePlaceholder}>
          <Ionicons name="briefcase-outline" size={30} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.kitInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.kitName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.priceTag}>{item.totalPrice?.toLocaleString("es-ES")}€</Text>
        </View>

        <Text style={styles.locationText}>
          <Ionicons name="location-outline" size={13} color="#888" /> {item.city}, {item.country}
        </Text>

        {(() => {
          const deliveryNoticeText = getDeliveryNotificationText(item);
          return deliveryNoticeText ? (
            <Text style={styles.deliveryNoticeText}>{deliveryNoticeText}</Text>
          ) : null;
        })()}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando kits asignados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Kits asignados | KeaKit</title>
        <meta name="description" content="Consulta los kits que tienes asignados en KeaKit."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>       
      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kits Asignados</Text>
        <View style={styles.headerRight} />
      </View>

      {kits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-full-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tienes kits asignados</Text>
          <Text style={styles.emptySubtext}>
            En cuanto te asignen uno, aparecerá aquí
          </Text>
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

      {error ? <Text style={{ textAlign: "center", color: "red" }}>{error}</Text> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.lg },
  loadingText: { marginTop: Spacing.md, fontSize: 16, color: "#666" },
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary },
  headerRight: { width: 40 },
  listContent: { padding: Spacing.md },
  kitCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: { width: 85, height: 85, borderRadius: 8, overflow: "hidden" },
  kitImagePlaceholder: { flex: 1, backgroundColor: "#f0f4ff", justifyContent: "center", alignItems: "center" },
  kitInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: "center" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kitName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, flex: 1, marginRight: 4 },
  priceTag: { fontSize: 14, fontWeight: "bold", color: Colors.primary },
  locationText: { fontSize: 12, color: "#888", marginVertical: 4 },
  deliveryNoticeText: { fontSize: 12, color: Colors.primary, marginTop: 2, marginBottom: 4, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: Spacing.md, textAlign: "center" },
  emptySubtext: { fontSize: 14, color: "#999", marginTop: Spacing.sm, textAlign: "center" },
});

export default AssignedKitsScreen;
