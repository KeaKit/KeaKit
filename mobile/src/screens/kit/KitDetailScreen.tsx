import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, KitResponse, KitStatus, Article } from '../../types';
import { Colors, commonStyles } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { API_ROUTES } from "../../config/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteKit } from '../../services/kitService';
import { createIncident } from '../../services';

type KitDetailRouteProp = RouteProp<RootStackParamList, 'KitDetail'>;

const KitDetailScreen: React.FC = () => {
  const route = useRoute<KitDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "KitDetail">>();
  const { user } = useAuth();
  
  const kitId = route.params?.kitId;

  const [kit, setKit] = useState<KitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportText, setReportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState< {id: number, title: string } | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalTitle, setActionModalTitle] = useState('');
  const [actionModalMessage, setActionModalMessage] = useState('');
  const [onActionConfirm, setOnActionConfirm] = useState<() => void>(() => () => {});
  const [ratedItems, setRatedItems] = useState<{ [key: number]: boolean }>({});

  const fetchKitDetail = useCallback(async () => {
    if (!kitId) return;
    
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.GET_KIT(kitId), {
        headers: user?.token
          ? {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            }
          : undefined,
      });
      
      if (!response.ok) throw new Error('Error al obtener kit');
      const data = await response.json();
      setKit(data);

      if (data && data.items?.length > 0 && user?.id) {
        const itemIds = data.items.map((item: any) => item.itemId);
        
        fetch(`${API_ROUTES.HAS_REVIEWED_ITEMS}?reviewerId=${user.id}&kitId=${kitId}&itemIds=${itemIds.join(',')}`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : undefined,
        })
          .then(res => res.json())
          .then((res: { [key: number]: boolean }) => {
            setRatedItems(res);
          })
          .catch(err => console.error("Error al obtener items valorados", err));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [kitId, user?.token, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchKitDetail();
    }, [fetchKitDetail])
  );

  const handleConfirmKit = async () => {
    try {
      setConfirming(true);
      const response = await fetch(API_ROUTES.CONFIRM_KIT(kitId), {
        method: 'PATCH',
        headers: user?.token
          ? {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            }
          : undefined,
      });
      if (response.ok) {
        navigation.goBack();
      } else {
        console.error("Error en el servidor al confirmar el kit");
      }
    } catch (error) {
      console.error("No se pudo procesar la confirmación:", error);
    } finally {
      setConfirming(false);
    }
  };

  const openActionModal = (title: string, message: string, onConfirm: () => void) => {
    setActionModalTitle(title);
    setActionModalMessage(message);
    setOnActionConfirm(() => onConfirm);
    setActionModalVisible(true);
  };  

  const handleSubmitReport = async () => {
    if (!selectedItem || !user) return;

    if (!reportText.trim()) {
      setError("La descripción del reporte es obligatoria.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createIncident(
        {
          title: `El artículo ${selectedItem.title} no cumple con lo prometido.`,
          description: reportText.trim(),
          type: "DAMAGED_ITEM",
          user: { id: user.id },
          relatedItem: selectedItem.id
            ? { id: selectedItem.id }
            : null,
        },
        user.token,
      );

      setReportModalVisible(false);
      setReportText("");
      setError(null);

      navigation.navigate('MyIncidents');

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la incidencia"
      );
    } finally {
      setLoading(false);
    }
  };

  // Determinar si el kit completo ya fue valorado (todos los items valorados)
  const isKitFullyRated = () => {
    if (!kit?.items || kit.items.length === 0) return false;
    return kit.items.every(item => ratedItems[item.itemId] === true);
  };

  if (loading || confirming) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        {confirming && <Text style={styles.deletingText}>Confirmando recepción...</Text>}
      </View>
    );
  }

  if (deleting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.deletingText}>Eliminando kit...</Text>
      </View>
    );
  }

  if (!kit) return null;

  const navigateToUserReviews = (ownerId: number, ownerName: string) => {
    navigation.navigate('UserRatings', {
      userId: ownerId,
      userName: ownerName,
    });
  };

  const getStatusInfo = (status: KitStatus) => {
      switch (status) {
        case KitStatus.DRAFT:
          return { label: "Modo borrador"};
        case KitStatus.PAID:
          return { label: "Pagado"};
        case KitStatus.ACTIVE:
          return { label: "Activo"};
        case KitStatus.CANCELLED:
          return { label: "Cancelado"};
        case KitStatus.FINISHED:
          return { label: "Finalizado"};
        default:
          return { label: status};
      }
    };

  const statusInfo = getStatusInfo(kit.status);

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Kit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.kitNameText}>{kit.name}</Text>
          <View style={styles.statusBadge}> 
            <Text style={styles.statusText}>{statusInfo.label}</Text>
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
                <Text style={styles.itemMeta}>
                  {item.ownerName ? (
                    <Text
                      style={{ color: "#007AFF" }}
                      onPress={() => navigateToUserReviews(item.ownerId, item.ownerName)}
                    >
                      {item.ownerName}
                    </Text>
                  ) : ""} • {item.category} • {item.pricePerMonth}€/mes
                </Text>
              </View>

              {kit.status === KitStatus.PAID && (
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => {
                    setSelectedItem({
                      id: item.itemId,
                      title: item.name || `Artículo con ID: ${item.itemId}`,
                    });
                    setReportModalVisible(true);
                  }}
                >
                  <Ionicons name="flag-outline" size={14} color="#FF3B30" />
                  <Text style={styles.reportButtonText}>Reportar</Text>
                </TouchableOpacity>
              )}

              <Ionicons name="cube-outline" size={20} color="#DDD" />
            </View>
          ))}
          {kit.items && kit.items.length > 3 && (
            <TouchableOpacity style={styles.verMasBtn} onPress={() => setExpanded(!expanded)}>
              <Text style={styles.verMasText}>
                {expanded ? "Ver menos" : `Ver ${kit.items.length - 3} más...`}
              </Text>
              <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{kit.totalPrice?.toLocaleString('es-ES')} €</Text>
        </View>

        {/* Botón de seguimiento solo (sin agrupar) */}
        <TouchableOpacity
          style={styles.trackingButton}
          onPress={() => navigation.navigate("Tracking", { kitId: kit.id })}
        >
          <Ionicons name="navigate-outline" size={18} color={Colors.primary} />
          <Text style={styles.trackingButtonText}>Ver seguimiento</Text>
        </TouchableOpacity>

        {/* Botón único de valoración del kit (debajo del seguimiento) */}
        {kit.status === "FINISHED" && !isKitFullyRated() && (
          <TouchableOpacity
            style={[styles.trackingButton, { borderColor: Colors.warning, marginTop: 12 }]}
            onPress={() => navigation.navigate("CreateRating", { kitId: kit.id } as any)}
          >
            <Ionicons name="star-outline" size={18} color={Colors.warning} />
            <Text style={[styles.trackingButtonText, { color: Colors.warning }]}>Valorar kit</Text>
          </TouchableOpacity>
        )}

        {kit.status === "FINISHED" && isKitFullyRated() && (
          <View style={[styles.trackingButton, styles.disabledButton, { marginTop: 12 }]}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.trackingButtonText, { color: Colors.success }]}>Ya valorado</Text>
          </View>
        )}

        {kit.status === KitStatus.DRAFT && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => navigation.navigate("Checkout", { kitId: kit.id })}
          >
            <Text style={styles.confirmButtonText}>Realizar pedido</Text>
          </TouchableOpacity>
        )}
        {kit.status === KitStatus.DRAFT && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => openActionModal(
              'Eliminar Kit',
              '¿Estás seguro de que deseas eliminar este kit? Esta acción no se puede deshacer.',
              async () => {
                try {
                  setDeleting(true);
                  await deleteKit(kitId, user?.token ?? "");
                  navigation.navigate("MyKits");
                } catch (error) {
                  console.error('Error', 'No se pudo eliminar el kit.', error);
                } finally {
                  setDeleting(false);
                  setActionModalVisible(false);
                }
              }
            )}
          >
            <Text style={styles.deleteButtonText}>Eliminar kit</Text>
          </TouchableOpacity>
        )}

        {kit.status === KitStatus.PAID && user?.role === "USER" && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => openActionModal(
              'Confirmar Recepción',
              '¿Deseas confirmar la recepción de este kit?',
              handleConfirmKit
            )}
          >
            <Ionicons name="checkmark-done-outline" size={20} color="#04ac20" />
            <Text style={styles.confirmButtonText}>Confirmar recepción</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={actionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{actionModalTitle}</Text>
            <Text style={styles.modalSubtitle}>{actionModalMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setActionModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={onActionConfirm}>
                <Text style={styles.modalSubmitText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModalContainer}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reportar problema</Text>
              <TouchableOpacity
                onPress={() => {
                  setReportModalVisible(false);
                  setReportText("");
                }}
              >
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              ¿Por qué el ítem <Text style={styles.modalBoldSubtitle}>{selectedItem?.title}</Text> no cumple con lo prometido?
            </Text>

            <Text style={styles.modalSubSubtitle}>
              Enviar el informe creará automáticamente una incidencia.
            </Text>

            <TextInput
              style={styles.textArea}
              placeholder="Detalla más el problema..."
              placeholderTextColor="#999"
              multiline
              value={reportText}
              onChangeText={(text) => {
                setReportText(text);
                if (error) setError(null);
              }}
            />

            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setReportModalVisible(false);
                  setReportText("");
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  void handleSubmitReport();
                }}
              >
                <Ionicons name="flag" size={16} color="#FFF" />
                <Text style={styles.submitText}>Enviar</Text>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 18, marginBottom: 8, textAlign: 'center' },
  modalBoldSubtitle: { fontSize: 18, marginBottom: 8, textAlign: 'center', fontWeight: '600', color: '#111', },
  modalSubSubtitle: { fontSize: 15, marginBottom: 15, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 8, backgroundColor: '#F7F7F7' },
  modalItemSelected: { backgroundColor: '#E8F0FE' },
  modalItemText: { fontSize: 14, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalCancelButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#CCC', marginRight: 10, alignItems: 'center' },
  modalCancelText: { color: '#666', fontWeight: '600' },
  modalSubmitButton: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  modalSubmitText: { color: '#FFF', fontWeight: 'bold' },
  trackingButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "#FFF",
    gap: 8,
  },
  trackingButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    borderColor: Colors.success,
    opacity: 0.8,
  },
  reportButton: { flexDirection: "row", marginRight: 10, alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: "#FFF1F0", },
  reportButtonText: { fontSize: 12, fontWeight: "600", color: "#FF3B30", },
  itemButton: { marginLeft: 20, flexDirection: "column", alignItems: "center", padding: 6 },
  itemButtonText: { fontSize: 12, color: "#666", fontWeight: "600" },
  textArea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 20, minHeight: 100, textAlignVertical: "top", color: "#000", },
  reportModalContainer: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, },
  modalButtonsRow: { flexDirection: "row", gap: 10, marginTop: 10, },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#DDD", alignItems: "center", },
  cancelText: { color: "#666", fontWeight: "600", },
  submitButton: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, padding: 14, borderRadius: 10, backgroundColor: "#FF3B30", },
  submitText: { color: "#FFF", fontWeight: "bold", },
  errorText: { color: "#FF3B30", marginTop: 8, textAlign: "center", },
});

export default KitDetailScreen;