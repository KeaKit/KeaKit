import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, KitResponse, KitStatus } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { API_ROUTES } from "../../config/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type KitDetailRouteProp = RouteProp<RootStackParamList, 'KitDetail'>;

const KitDetailScreen: React.FC = () => {
  const route = useRoute<KitDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "KitDetail">>();
  const { user } = useAuth();
  const host = Platform.OS === 'web' ? 'localhost' : '10.0.2.2';
  const BASE = `http://${host}:8080`;
  
  const kitId = route.params?.kitId;

  const [kit, setKit] = useState<KitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchKitDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE}/api/kits/${kitId}`);
        if (!response.ok) throw new Error('Error al obtener kit');
        const data = await response.json();
        setKit(data);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };
    if (kitId) fetchKitDetail();
  }, [kitId]);

  const handleConfirmKit = () => {
    Alert.alert(
      "Confirmar Alquiler",
      "¿Estás seguro de que deseas confirmar la recepción de este kit? Esta acción implica que todos los productos coinciden con la descripción, imágenes y estado prometido.",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              setConfirming(true);
              
              const response = await fetch(`${BASE}/api/kits/confirm/${kitId}`, {
                method: 'PATCH',
              });

              if (response.ok) {
                Alert.alert("Éxito", "El kit ha sido confirmado correctamente.");
                navigation.goBack();
              } else {
                throw new Error("Error en el servidor");
              }
            } catch (error) {
              Alert.alert("Aviso", "No se pudo procesar la confirmación en el servidor real.");
            } finally {
              setConfirming(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelKit = () => {
    Alert.alert(
      "Cancelar Alquiler",
      "¿Estás seguro de que deseas eliminar este kit? Esta acción es irreversible.",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              
         
              const response = await fetch(`${BASE}/api/kits/${kitId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert("Éxito", "El kit ha sido cancelado correctamente.");
                navigation.goBack();
              } else {
                throw new Error("Error en el servidor");
              }
            } catch (error) {
              Alert.alert("Aviso", "No se pudo procesar el borrado en el servidor real.");
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleReportProblem = () => {
    setReportModalVisible(true);
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmitReport = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Selecciona al menos un producto");
      return;
    }

    console.log("Productos reportados:", selectedItems);

    Alert.alert("Reporte enviado correctamente");
    setReportModalVisible(false);
    setSelectedItems([]);
  };

  if (loading || confirming) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {confirming && <Text style={styles.deletingText}>Confirmando recepción...</Text>}
      </View>
    );
  }

  if (loading || deleting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {deleting && <Text style={styles.deletingText}>Eliminando kit...</Text>}
      </View>
    );
  }

  if (!kit) return null;

  return (
    <SafeAreaView style={commonStyles.container}>

      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Kit</Text>
        {kit.status === KitStatus.PAID && (
        <TouchableOpacity 
          onPress={handleReportProblem} 
          style={styles.reportButton}
        >
          <Ionicons name="flag-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
        )}
        {kit.status !== KitStatus.PAID && (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.kitNameText}>{kit.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{kit.status}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>País</Text>
            <Text style={styles.value}>{kit.country}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Ciudad</Text>
            <Text style={styles.value}>{kit.city}</Text>
          </View>
        </View>


        <Text style={styles.sectionTitle}>Productos Incluidos</Text>
        <View style={styles.itemsContainer}>
          {kit.items?.slice(0, expanded ? kit.items.length : 3).map((item) => (
            <View key={item.itemId} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.category} • {item.pricePerMonth}€/mes</Text>
              </View>
              <Ionicons name="cube-outline" size={20} color="#DDD" />
            </View>
          ))}

          {kit.items && kit.items.length > 3 && (
            <TouchableOpacity 
              style={styles.verMasBtn} 
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.verMasText}>
                {expanded ? "Ver menos" : `Ver ${kit.items.length - 3} más...`}
              </Text>
              <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>TOTAL MENSUAL ESTIMADO</Text>
          <Text style={styles.totalValue}>{kit.totalPrice?.toLocaleString('es-ES')} €</Text>
        </View>

        {kit.status === KitStatus.DRAFT && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate("Checkout", kit)}
          >
            <Text style={styles.confirmButtonText}>Realizar pedido</Text>
          </TouchableOpacity>
        )}
        {kit.status === KitStatus.DRAFT && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={async () => {
              try {
                const res = await fetch(API_ROUTES.KIT_CANCEL(kit.id), {
                  method: "PATCH",
                });
                if (!res.ok) throw new Error("No se pudo cancelar");
                Alert.alert("Cancelado", "Kit cancelado.");
                navigation.goBack();
              } catch (e) {
                Alert.alert("Error", "No se pudo cancelar.");
              }
            }}
          >
            <Text style={styles.deleteButtonText}>Eliminar kit</Text>
          </TouchableOpacity>
        )}


        {kit.status === KitStatus.PAID && (
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmKit}>
            <Ionicons name="checkmark-done-outline" size={20} color="#04ac20" />
            <Text style={styles.confirmButtonText}>Confirmar recepción</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <Text style={styles.modalTitle}>Reportar Problema</Text>
            <Text style={styles.modalSubtitle}>¿Qué productos no cumplen con la descripción?</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {kit.items?.map((item) => {
                const isSelected = selectedItems.includes(item.itemId);

                return (
                  <TouchableOpacity
                    key={item.itemId}
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected
                    ]}
                    onPress={() => toggleItemSelection(item.itemId)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setReportModalVisible(false);
                  setSelectedItems([]);
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmitReport}
              >
                <Text style={styles.modalSubmitText}>Enviar reporte</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  deletingText: { marginTop: 10, color: '#666', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  backButton: { padding: 10 },
  scrollContent: { padding: 20 },
  mainCard: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  kitNameText: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  statusBadge: { backgroundColor: '#E8F0FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  statusText: { color: Colors.primary, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, backgroundColor: '#F9F9F9', padding: 15, borderRadius: 15 },
  infoBox: { flex: 1 },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  itemsContainer: { marginBottom: 20 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  itemMeta: { fontSize: 12, color: '#777', marginTop: 2 },
  verMasBtn: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', marginTop: 5, padding: 8 },
  verMasText: { fontSize: 14, color: '#666', fontWeight: '600', marginRight: 5 },
  priceContainer: { marginTop: 20, alignItems: 'center', padding: 20, borderTopWidth: 1, borderColor: '#EEE' },
  totalLabel: { fontSize: 11, color: '#AAA', letterSpacing: 1 },
  totalValue: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginTop: 5 },
  confirmButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#04ac20', backgroundColor: '#FFF' },
  confirmButtonText: { color: '#04ac20', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  deleteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#FF3B30', backgroundColor: '#FFF' },
  deleteButtonText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  reportButton: { padding: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 18, marginBottom: 15, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 8, backgroundColor: '#F7F7F7' },
  modalItemSelected: { backgroundColor: '#E8F0FE' },
  modalItemText: { fontSize: 14, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalCancelButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#CCC', marginRight: 10, alignItems: 'center', },
  modalCancelText: { color: '#666', fontWeight: '600', },
  modalSubmitButton: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  modalSubmitText: { color: '#FFF', fontWeight: 'bold' },
});

export default KitDetailScreen;