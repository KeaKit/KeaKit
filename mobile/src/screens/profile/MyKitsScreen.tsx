import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KitResponse, KitStatus, RootStackParamList } from "../../types";
import { API_ROUTES } from "../../config/api";
import { Colors, Spacing, commonStyles } from "../../styles";

type MyKitsNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;

const MyKitsScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigation = useNavigation<MyKitsNav>();

  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKits = useCallback(async () => {
    console.log('[MyKits] loadKits called — user:', user?.id, 'authLoading:', authLoading);
    if (!user?.token) {
      console.log('[MyKits] no user or token, stopping loader');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ROUTES.MY_KITS(user.id), {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Filtramos los cancelados para no mostrarlos en la pantalla principal
      setKits(data.filter((k: KitResponse) => k.status !== KitStatus.CANCELLED));
    } catch (err) {
      console.log('[MyKits] error:', err);
      setError("Error al cargar alquileres");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadKits();
    }
  }, [authLoading, loadKits]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading) {
        loadKits();
      }
    }, [authLoading, loadKits]),
  );

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    const parts = dateString.split("-");
    return parts.length === 3
      ? `${parts[2]}/${parts[1]}/${parts[0]}`
      : dateString;
  };

  const getStatusInfo = (status: KitStatus) => {
    switch (status) {
      case KitStatus.DRAFT:
        return { label: "Modo borrador", color: "#14fdfdff" };
      case KitStatus.PAID:
        return { label: "Pagado", color: "#17a2b8" };
      case KitStatus.ACTIVE:
        return { label: "Activo", color: "#28a745" };
      case KitStatus.CANCELLED:
        return { label: "Cancelado", color: "#dc3545" };
      case KitStatus.FINISHED:
        return { label: "Finalizado", color: "#6c757d" };
      default:
        return { label: status, color: "#999" };
    }
  };

  const getDeliveryNotificationText = (item: KitResponse) => {
    if (!item.deliveryNotification) return null;
    if (item.status === KitStatus.FINISHED || item.status === KitStatus.CANCELLED) {
      return null;
    }
    if (item.status === KitStatus.ACTIVE) {
      return 'En uso';
    }
    return item.deliveryNotification;
  };

  const renderKit = ({ item }: { item: KitResponse }) => {
    const deliveryNoticeText = getDeliveryNotificationText(item);
    const statusInfo = item.status
      ? getStatusInfo(item.status)
      : { label: "Desconocido", color: "#999" };

    const originalTotal =
      item.appliedDiscount && item.appliedDiscount > 0
        ? item.totalPrice + item.subtotalPrice * item.appliedDiscount
        : null;

    return (
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
          <Text style={styles.kitName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={13} color="#888" />{" "}
            {item.city}, {item.country}
          </Text>

          {deliveryNoticeText ? (
            <Text style={styles.deliveryNoticeText}>
              {deliveryNoticeText}
            </Text>
          ) : null}

          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color, alignSelf: "flex-start", marginTop: 8 }]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.kitRightColumn}>
          <View style={styles.priceContainer}>
            {originalTotal != null ? (
              <>
                <Text style={styles.priceTagStrikethrough}>
                  {originalTotal.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}€
                </Text>
                <Text style={styles.promoAppliedText}>Descuento aplicado</Text>
                <Text style={styles.priceTagDiscounted}>
                  {item.totalPrice?.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}€
                </Text>
              </>
            ) : (
              <Text style={styles.priceTag}>
                {item.totalPrice?.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}€
              </Text>
            )}
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Fin alquiler:</Text>
            <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Alquileres</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("MyKitsHistory")}
        >
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadKits}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : kits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-full-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No tienes alquileres vigentes</Text>
          <Text style={styles.emptySubtext}>
            Explora el catálogo para alquilar tu primer kit de artículos
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    padding: Spacing.sm,
  },
  historyButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: Spacing.md,
  },
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
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 8,
    overflow: "hidden",
  },
  kitImagePlaceholder: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  kitInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  kitName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  locationText: {
    fontSize: 12,
    color: "#888",
    marginVertical: 4,
  },
  deliveryNoticeText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  kitRightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingLeft: Spacing.sm,
    minWidth: 100,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceTag: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "right",
  },
  priceTagStrikethrough: {
    fontSize: 12,
    fontWeight: "500",
    color: "#aaa",
    textDecorationLine: "line-through",
    textAlign: "right",
  },
  priceTagDiscounted: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e05252",
    textAlign: "right",
  },
  promoAppliedText: {
    fontSize: 10,
    color: "#e05252",
    fontWeight: "600",
    textAlign: "right",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 10,
    color: "#999",
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyKitsScreen;