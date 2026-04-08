import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, DefaultKit } from "../../../types";
import { Colors } from "../../../styles";
import { API_ROUTES } from "../../../config/api";

type DefaultKitsNav = NativeStackNavigationProp<RootStackParamList, "DefaultKits">;

const DefaultKitsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DefaultKitsNav>();

  // Usamos el tipo DefaultKit igual que en la pantalla antigua
  const [kits, setDefaultKits] = useState<DefaultKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<DefaultKit | null>(null);

  // Lógica de carga exacta de PurchaseDefaultKitScreen
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        setLoading(true);
        console.log("1. Llamando a:", API_ROUTES.DEFAULT_KITS);
        
        const kitsRes = await fetch(API_ROUTES.DEFAULT_KITS, { 
            headers: { Authorization: `Bearer ${user.token}` },
        });

        console.log("2. Status de la respuesta:", kitsRes.status);

        if (kitsRes.ok) {
          const kitsData = await kitsRes.json();
          // console.log("3. Datos recibidos:", JSON.stringify(kitsData, null, 2));
          setDefaultKits(kitsData);
        } else {
          const errorText = await kitsRes.text();
          console.log("3. Error del backend:", errorText);
          if (kitsRes.status === 403) {
            Alert.alert("Acceso Denegado", "No tienes permisos para ver el catálogo de kits.");
          }
        }
      } catch (error) {
        console.error("Error de red/código cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.token]);

  // Renderizado de cada tarjeta, usando las propiedades de DefaultKit
  const renderKitCard = ({ item }: { item: DefaultKit }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => setSelectedKit(item)}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="cube-outline" size={32} color={Colors.primaryHome} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.items?.length || 0} artículos incluidos
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primaryHome} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kits Express</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryHome} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={kits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderKitCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay kits disponibles en este momento.</Text>}
        />
      )}

      {/* BOTTOM SHEET (Panel de detalles) */}
      <Modal
        visible={!!selectedKit}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedKit(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBgDismiss} onPress={() => setSelectedKit(null)} />
          
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{selectedKit?.name}</Text>
            <Text style={styles.sheetSubtitle}>Contenido del kit:</Text>
            
            <ScrollView style={styles.itemsList}>
              {/* Leemos los artículos como lo hacía la pantalla antigua: item.item.title */}
              {selectedKit?.items?.map((kItem, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>• {kItem.item.title}</Text>
                  <Text style={styles.itemPrice}>{kItem.item.pricePerMonth.toFixed(2)}€</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.actionButtonsRow}>
              {/* Botón Personalizar */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnSecondary]}
                onPress={() => {
                  if (selectedKit?.id) {
                    const kitId = selectedKit.id;
                    setSelectedKit(null);
                    navigation.navigate("EditDefaultKit", { kitId });
                  }
                }}
              >
                <Ionicons name="pencil" size={18} color={Colors.primaryHome} />
                <Text style={styles.btnSecondaryText}>Personalizar</Text>
              </TouchableOpacity>

              {/* Botón Comprar Tal Cual */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnPrimary]}
                onPress={() => {
                  if (selectedKit?.id) {
                    const kitId = selectedKit.id;
                    setSelectedKit(null);
                    navigation.navigate("PurchaseDefaultKit", { kitId });
                  }
                }}
              >
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Alquilar tal cual</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#FFF" },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.primaryHome },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#EBF5FF", alignItems: "center", justifyContent: "center", marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: "#6B7280" },
  emptyText: { textAlign: "center", marginTop: 40, color: "#9CA3AF" },
  
  // Estilos del Bottom Sheet
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBgDismiss: { flex: 1 },
  bottomSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "80%" },
  sheetHandle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: "800", color: Colors.primaryHome, marginBottom: 8 },
  sheetSubtitle: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 12 },
  itemsList: { maxHeight: 200, marginBottom: 24 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemName: { fontSize: 15, color: "#374151", flex: 1 },
  itemPrice: { fontSize: 15, fontWeight: "700", color: Colors.primaryHome },
  actionButtonsRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  btnSecondary: { backgroundColor: "#EBF5FF" },
  btnSecondaryText: { color: Colors.primaryHome, fontWeight: "700", fontSize: 15 },
  btnPrimary: { backgroundColor: Colors.primaryHome },
  btnPrimaryText: { color: "#FFF", fontWeight: "700", fontSize: 15 }
});

export default DefaultKitsScreen;