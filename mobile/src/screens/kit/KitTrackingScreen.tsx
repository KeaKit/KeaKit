import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList, KitDeliveryResponse, DeliveryStatus } from "../../types";
import { Colors, Spacing, commonStyles } from "../../styles";
import { useAuth } from "../../context/AuthContext";
import { getKitTracking, updateKitTracking } from "../../services/kitService";

type TrackingRouteProp = RouteProp<RootStackParamList, "Tracking">;

const KitTrackingScreen: React.FC = () => {
  const route = useRoute<TrackingRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const kitId = route.params?.kitId;

  const [tracking, setTracking] = useState<KitDeliveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusLabel = (status?: DeliveryStatus | null) => {
    switch (status) {
      case "PICKED_UP":
        return "Recogido";
      case "IN_TRANSIT":
        return "En camino";
      case "NEARBY":
        return "Cerca";
      case "DELIVERED":
        return "Entregado";
      default:
        return "Sin estado";
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  };

  const loadTracking = async () => {
    if (!user?.token || !kitId) return;
    try {
      setLoading(true);
      const data = await getKitTracking(kitId, user.token);
      setTracking(data);
    } catch (e) {
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracking();
  }, [kitId, user?.token]);

  const updateStatus = async (status: DeliveryStatus) => {
    if (!user?.token || !kitId) return;
    try {
      setUpdating(true);
      const updated = await updateKitTracking(kitId, { status }, user.token);
      setTracking(updated);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : !tracking ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay información de seguimiento.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.line}>
            Estado: <Text style={styles.value}>{statusLabel(tracking.status)}</Text>
          </Text>
          <Text style={styles.line}>
            Estimado: <Text style={styles.value}>{formatDateTime(tracking.estimatedArrivalAt)}</Text>
          </Text>
          <Text style={styles.line}>
            Ubicación: <Text style={styles.value}>{tracking.lastLocation ?? "-"}</Text>
          </Text>
          <Text style={styles.line}>
            Última actualización: <Text style={styles.value}>{formatDateTime(tracking.lastUpdate)}</Text>
          </Text>

          {user?.role === "COURIER" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateStatus("PICKED_UP")}
                disabled={updating}
              >
                <Text style={styles.actionText}>Recogido</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateStatus("IN_TRANSIT")}
                disabled={updating}
              >
                <Text style={styles.actionText}>En camino</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateStatus("NEARBY")}
                disabled={updating}
              >
                <Text style={styles.actionText}>Cerca</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionDone]}
                onPress={() => updateStatus("DELIVERED")}
                disabled={updating}
              >
                <Text style={styles.actionTextDone}>Entregado</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.textPrimary },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777" },
  card: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#FFF",
  },
  line: { fontSize: 14, color: "#555", marginTop: 6 },
  value: { color: "#222", fontWeight: "600" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "#FFF",
  },
  actionText: { color: Colors.primary, fontWeight: "600", fontSize: 12 },
  actionDone: { borderColor: "#04ac20" },
  actionTextDone: { color: "#04ac20", fontWeight: "700", fontSize: 12 },
});

export default KitTrackingScreen;
