import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput as PaperTextInput, Button } from "react-native-paper";
import { Colors, commonStyles } from "../styles";
import { createKitStyles } from "../styles/createKitStyles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useNavigation } from "@react-navigation/native";
import { ArticleMapView } from "./ArticleMapView";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "./NotificationContext";
import { requestArticleAvailabilityNotification } from "../services/articleService";
import { createDemandAlert } from "../services/notificationService";

type ProductSelectionNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type CatalogProduct = {
  id: number;
  title: string;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | string;
  category?: string;
  city?: string;
  ownerId: number;
  ownerName?: string;
  imageUrl?: string | null;
  totalUnits: number;
  availableFrom?: string;
  availableUntil?: string;
  isAvailable?: boolean;
  availabilityMessage?: string;
  distanceKm?: number;
  cityLat?: number;
  cityLng?: number;
};

type ProductSelectionModalProps = {
  visible: boolean;
  onDismiss: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  categoryFilter: "ALL" | string;
  onCategoryFilterChange: (category: "ALL" | string) => void;
  categories: string[];
  filteredProducts: CatalogProduct[];
  tempSelectedQuantities: Record<number, number>;
  onToggleSelection: (id: number) => void;
  onChangeQuantity: (id: number, quantity: number, maxQuantity: number) => void;
  onConfirm: () => void;
  userCity?: string;
  showOnlyMyCity: boolean;
  onToggleMyCity: (show: boolean) => void;
  showOnlyAvailable: boolean;
  onToggleAvailable: (show: boolean) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  expandedSearch: boolean;
  onToggleExpandedSearch: () => void;
  loadingNearby: boolean;
  targetCityCoords?: { lat: number; lng: number } | null;
  mapProducts?: { id: number; title: string; city?: string | null; pricePerMonth: number; ownerName?: string | null; distanceKm?: number; cityLat?: number; cityLng?: number }[];
};

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onDismiss,
  searchText,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  filteredProducts,
  tempSelectedQuantities,
  onToggleSelection,
  onChangeQuantity,
  onConfirm,
  userCity,
  showOnlyMyCity,
  onToggleMyCity,
  showOnlyAvailable,
  onToggleAvailable,
  startDate,
  endDate,
  expandedSearch,
  onToggleExpandedSearch,
  loadingNearby,
  targetCityCoords,
  mapProducts = [],
}) => {
  const navigation = useNavigation<ProductSelectionNav>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [mapView, setMapView] = React.useState(false);
  const [requestingIds, setRequestingIds] = React.useState<Record<number, boolean>>({});

  const handleRequestAvailability = async (articleId: number) => {
    if (!user?.id || !user.token) {
      showNotification('Necesitas iniciar sesión para solicitar el aviso.', 'error');
      return;
    }

    if (requestingIds[articleId]) return;
    setRequestingIds((prev) => ({ ...prev, [articleId]: true }));

    try {
      // Enviar ambas notificaciones: aviso al arrendatario y demanda al arrendador
      await Promise.all([
        requestArticleAvailabilityNotification(articleId, user.id, user.token),
        createDemandAlert(articleId, user.id, user.token)
      ]);
      showNotification('Te avisaremos cuando el artículo vuelva a estar disponible.', 'success');
      } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'No se pudo solicitar el aviso.',
        'error',
      );
    } finally {
      setRequestingIds((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // Calcular disponibilidad de productos basado en fechas
  const productsWithAvailability = React.useMemo(() => {
    if (!startDate || !endDate) {
      return filteredProducts.map((p) => ({ ...p, isAvailable: true }));
    }

    const requestStart = Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const requestEnd = Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    const mapped = filteredProducts.map((p) => {
      if (!p.availableFrom || !p.availableUntil) {
        return {
          ...p,
          isAvailable: false,
          availabilityMessage: "Sin fechas de disponibilidad",
        };
      }

      const [yearFrom, monthFrom, dayFrom] = p.availableFrom.split("-");
      const productFrom = Date.UTC(
        parseInt(yearFrom, 10),
        parseInt(monthFrom, 10) - 1,
        parseInt(dayFrom, 10),
      );
      const [yearUntil, monthUntil, dayUntil] = p.availableUntil.split("-");
      const productUntil = Date.UTC(
        parseInt(yearUntil, 10),
        parseInt(monthUntil, 10) - 1,
        parseInt(dayUntil, 10),
      );

      const isAvailable =
        productFrom <= requestStart && productUntil >= requestEnd;

      if (!isAvailable) {
        const formatDate = (dateStr: string) => {
          const [year, month, day] = dateStr.split("-");
          return `${day}/${month}/${year}`;
        };
        const availabilityMessage = `Disponible: ${formatDate(p.availableFrom)} - ${formatDate(p.availableUntil)}`;
        return { ...p, isAvailable: false, availabilityMessage };
      }

      return { ...p, isAvailable: true };
    });

    // Filtrar por disponibilidad si el checkbox está activado
    if (showOnlyAvailable) {
      return mapped.filter((p) => p.isAvailable === true);
    }

    return mapped;
  }, [filteredProducts, startDate, endDate, showOnlyAvailable]);

  const navigateToUserReviews = (ownerId: number, ownerName: string) => {
    onDismiss();
    navigation.navigate('UserRatings', {
      userId: ownerId,
      userName: ownerName,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={createKitStyles.modalOverlay}>
        <View style={createKitStyles.modalCard}>
          <Text style={createKitStyles.modalTitle}>Selecciona productos</Text>
          <View style={{ gap: 8, marginBottom: 12 }}>
            <PaperTextInput
              mode="outlined"
              label="Busca un artículo o servicio"
              value={searchText}
              onChangeText={onSearchChange}
              left={<PaperTextInput.Icon icon="magnify" />}
              style={{ backgroundColor: Colors.backgroundWhite }}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setMapView(false)}
                style={{
                  flex: 1, flexDirection: "row", alignItems: "center",
                  justifyContent: "center", gap: 6, paddingVertical: 8,
                  borderRadius: 8, borderWidth: 1,
                  borderColor: !mapView ? Colors.primary : Colors.border,
                  backgroundColor: !mapView ? "#E3F2FD" : Colors.backgroundWhite,
                }}
              >
                <Ionicons name="list-outline" size={18} color={!mapView ? Colors.primary : Colors.textSecondary} />
                <Text style={{ color: !mapView ? Colors.primary : Colors.textSecondary, fontSize: 13 }}>Lista</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMapView(true)}
                style={{
                  flex: 1, flexDirection: "row", alignItems: "center",
                  justifyContent: "center", gap: 6, paddingVertical: 8,
                  borderRadius: 8, borderWidth: 1,
                  borderColor: mapView ? Colors.primary : Colors.border,
                  backgroundColor: mapView ? "#E3F2FD" : Colors.backgroundWhite,
                }}
              >
                <Ionicons name="map-outline" size={18} color={mapView ? Colors.primary : Colors.textSecondary} />
                <Text style={{ color: mapView ? Colors.primary : Colors.textSecondary, fontSize: 13 }}>Mapa</Text>
              </TouchableOpacity>
            </View>


            {userCity && (
              <TouchableOpacity
                onPress={() => onToggleMyCity(!showOnlyMyCity)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: showOnlyMyCity
                    ? "#E3F2FD"
                    : Colors.backgroundWhite,
                  borderWidth: 1,
                  borderColor: showOnlyMyCity ? Colors.primary : Colors.border,
                  gap: 8,
                }}
              >
                <Ionicons
                  name={showOnlyMyCity ? "checkbox" : "square-outline"}
                  size={20}
                  color={Colors.primary}
                />
                <Text style={{ color: Colors.primary, flex: 1 }}>
                  Solo productos en {userCity}
                </Text>
              </TouchableOpacity>
            )}

            {startDate && endDate && (
              <TouchableOpacity
                onPress={() => onToggleAvailable(!showOnlyAvailable)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: showOnlyAvailable
                    ? "#E3F2FD"
                    : Colors.backgroundWhite,
                  borderWidth: 1,
                  borderColor: showOnlyAvailable
                    ? Colors.primary
                    : Colors.border,
                  gap: 8,
                }}
              >
                <Ionicons
                  name={showOnlyAvailable ? "checkbox" : "square-outline"}
                  size={20}
                  color={Colors.primary}
                />
                <Text style={{ color: Colors.primary, flex: 1 }}>
                  Solo productos disponibles en las fechas seleccionadas
                </Text>
              </TouchableOpacity>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => onCategoryFilterChange(c)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor:
                      categoryFilter === c ? Colors.primary : Colors.border,
                    backgroundColor:
                      categoryFilter === c ? "#EAF3F8" : Colors.backgroundWhite,
                  }}
                >
                  <Text style={{ color: Colors.primary }}>
                    {c === "ALL" ? "Todas las categorías" : c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {mapView ? (
            <ArticleMapView
              articles={(
                showOnlyMyCity && userCity
                  ? mapProducts.filter((a) => a.city?.toLowerCase() === userCity.toLowerCase())
                  : mapProducts
              ).map((a) => ({ ...a, city: a.city ?? undefined, ownerName: a.ownerName ?? undefined }))}
              targetCityCoords={targetCityCoords ?? null}
              userCity={userCity}
              selectedIds={Object.keys(tempSelectedQuantities).map(Number)}
              onAddArticle={onToggleSelection}
            />
          ) : null}

          <ScrollView style={[createKitStyles.modalList, mapView ? { height: 0 } : {}]}>
            {productsWithAvailability.length === 0 ? (
              <Text
                style={[
                  commonStyles.bodySecondary,
                  { textAlign: "center", marginTop: 10, marginBottom: 20 },
                ]}
              >
                No hay productos que cumplan los filtros.
              </Text>
            ) : (
              productsWithAvailability.map((p) => {
                const checked = Object.prototype.hasOwnProperty.call(
                  tempSelectedQuantities,
                  p.id,
                );
                const selectedQuantity = tempSelectedQuantities[p.id] ?? 1;
                // Cambio: Un producto se puede añadir si hay fechas válidas Y está AVAILABLE
                const canBeAdded = p.isAvailable && p.status === 'AVAILABLE';

                return (
                  <Pressable
                    key={p.id}
                    style={[
                      createKitStyles.modalRow,
                      !canBeAdded && {
                        opacity: 0.7,
                        backgroundColor: "#fafafa",
                      },
                    ]}
                    onPress={() => canBeAdded && onToggleSelection(p.id)}
                  >
                    {p.imageUrl ? (
                      <Image
                        source={{ uri: p.imageUrl }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          marginRight: 12,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          backgroundColor: Colors.brandBeige,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color={Colors.textSecondary}
                        />
                      </View>
                    )}
                    <View style={createKitStyles.productInfo}>
                      <Text style={createKitStyles.productTitle}>
                        {p.title}
                      </Text>

                      <Text style={commonStyles.caption}>
                          {p.ownerName ? (
                            <Text
                              style={{ color: "#007AFF" }}
                              onPress={() => navigateToUserReviews(p.ownerId, p.ownerName || "")}
                            >
                              {`${p.ownerName}`}
                            {" • "}
                            </Text> 
                          ) : ""}
                        {p.city ? `${p.city}` : ""}
                        {p.distanceKm !== undefined ? (
                          <Text style={{ color: "#F57F17" }}>{` · ~${p.distanceKm} km`}</Text>
                        ) : null}
                        {p.category ? ` · ${p.category}` : ""}
                        {" • "}
                        {p.city ? `${p.city} • ` : ""}
                        {p.category ? `${p.category}` : ""}
                      </Text>
                      <Text style={commonStyles.caption}>
                        Unidades disponibles: {p.totalUnits}
                      </Text>
                      {p.availabilityMessage && (
                        <Text
                          style={[
                            commonStyles.caption,
                            { color: p.isAvailable ? Colors.textSecondary : Colors.error, marginTop: 2 },
                          ]}
                        >
                          {p.availabilityMessage}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        marginRight: 8,
                      }}
                    >
                      {checked && canBeAdded ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginRight: 8,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              onChangeQuantity(
                                p.id,
                                selectedQuantity - 1,
                                p.totalUnits,
                              )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Reducir unidades de ${p.title}`}
                          >
                            <Ionicons
                              name="remove-circle-outline"
                              size={22}
                              color={Colors.primary}
                            />
                          </TouchableOpacity>

                          <Text style={createKitStyles.productTitle}>
                            {selectedQuantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() =>
                              onChangeQuantity(
                                p.id,
                                selectedQuantity + 1,
                                p.totalUnits,
                              )
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Aumentar unidades de ${p.title}`}
                          >
                            <Ionicons
                              name="add-circle-outline"
                              size={22}
                              color={
                                selectedQuantity >= p.totalUnits
                                  ? Colors.border
                                  : Colors.primary
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      ) : null}

                      <Text style={createKitStyles.productTitle}>
                        {p.pricePerMonth !== undefined
                          ? `${p.pricePerMonth.toFixed(2)}€`
                          : "N/A"}
                      </Text>
                      <Text style={commonStyles.bodySecondary}>/ mes</Text>
                    </View>
                    
                    {/* CAMBIO: Lógica de icono simplificada para mostrar siempre Checkmark o Campana */}
                    {canBeAdded ? (
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={checked ? Colors.success : Colors.primary}
                      />
                    ) : (
                      <View style={{ alignItems: 'center', justifyContent: 'center', width: 45 }}>
                        <TouchableOpacity
                          onPress={() => handleRequestAvailability(p.id)}
                          disabled={requestingIds[p.id]}
                          accessibilityRole="button"
                          accessibilityLabel={`Avisar cuando ${p.title} esté disponible`}
                        >
                          {requestingIds[p.id] ? (
                            <ActivityIndicator size="small" color={Colors.warning} />
                          ) : (
                            <Ionicons
                              name="notifications-outline"
                              size={22}
                              color={Colors.warning}
                            />
                          )}
                        </TouchableOpacity>
                        <Text
                          style={{
                            color: Colors.warning,
                            fontSize: 8,
                            marginTop: 2,
                            textAlign: 'center',
                          }}
                        >
                          Avisarme
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={createKitStyles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={[createKitStyles.modalBtn, { borderRadius: 8 }]}
              contentStyle={{ paddingVertical: 4 }}
            >
              Cancelar
            </Button>

            <Button
              mode="contained"
              onPress={onConfirm}
              icon="check"
              style={[createKitStyles.modalBtn, { borderRadius: 8 }]}
              contentStyle={{ paddingVertical: 4 }}
            >
              Añadir
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};