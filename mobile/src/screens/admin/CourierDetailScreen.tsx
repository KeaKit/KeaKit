import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, KitResponse, KitStatus } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { getAllKits, assignCourier, getUnassignedKits} from "../../services/kitService";
import { Colors, Spacing, commonStyles } from "../../styles";
import { Helmet } from 'react-helmet-async'; 

type CourierDetailRoute = RouteProp<RootStackParamList, "CourierDetail">;
type CourierDetailNav = NativeStackNavigationProp<RootStackParamList, "CourierDetail">;

const CourierDetailScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CourierDetailNav>();
  const route = useRoute<CourierDetailRoute>();

  const [modalVisible, setModalVisible] = useState(false);
  const [kits, setKits] = useState<KitResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { courier, isBusy } = route.params;

  const openAssignModal = async () => {
    if (!user?.token) return;
    setLoading(true);
    const data = await getUnassignedKits(user.token, courier.country); // solo país, para ciudad también pondríamos courier.city también
    setKits(data);
    setLoading(false);
    setModalVisible(true);
  };

  const handleAssign = async (kitId: number) => {
    if (!user?.token) return;
    setLoading(true);
    await assignCourier(kitId, courier.id, user.token);
    setLoading(false);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Helmet>
        <title>Detalle de Repartidor | KeaKit</title>
        <meta name="description" content="Detalle y asignación de kits a repartidores de KeaKit." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>     
      <View style={commonStyles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repartidores</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{courier.name}</Text>
        <Text style={styles.email}>{courier.email}</Text>
        <Text style={styles.country}>{courier.country}</Text>
      </View>

      {!isBusy && (
        <TouchableOpacity style={styles.assignButton} onPress={openAssignModal}>
          <Ionicons name="navigate-outline" size={18} color="#fff" />
          <Text style={styles.assignButtonText}>Asignar kit</Text>
        </TouchableOpacity>
      )}

      {isBusy && (
        <Text style={styles.busyHint}>Este courier ya tiene un kit asignado.</Text>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Kits disponibles ({courier.country})</Text>

            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : kits.length === 0 ? (
              <Text style={styles.emptyModalText}>No hay kits disponibles para asignar en este país</Text>
            ) : (
              <FlatList
                data={kits}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.kitRow}>
                    <View>
                      <Text style={styles.kitName}>{item.name}</Text>
                      <Text style={styles.kitMeta}>{item.city}, {item.country}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignSmallBtn}
                      onPress={() => handleAssign(item.id)}
                    >
                      <Text style={styles.assignSmallText}>Asignar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CourierDetailScreen;

const styles = StyleSheet.create({
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.textPrimary },
  card: {
    backgroundColor: "#fff",
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  email: { fontSize: 13, color: "#777", marginTop: 4 },
  country: { fontSize: 13, color: Colors.primary, marginTop: 6 },

  assignButton: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  assignButtonText: { color: "#fff", fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  emptyModalText: { textAlign: "center", color: "#666", marginTop: 10 },
  kitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  kitName: { fontSize: 15, fontWeight: "600", color: "#333" },
  kitMeta: { fontSize: 12, color: "#777" },
  assignSmallBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignSmallText: { color: "#fff", fontWeight: "600" },

  modalCancel: { marginTop: 12, alignItems: "center" },
  modalCancelText: { color: "#666", fontWeight: "600" },

  busyHint: {
  textAlign: "center",
  color: "#d9534f",
  marginTop: 10,
  fontWeight: "600",
},
});
