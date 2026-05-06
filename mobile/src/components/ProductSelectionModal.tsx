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
import { RootStackParamList, CatalogProduct } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "./NotificationContext";
// Servicios
import { requestArticleAvailabilityNotification } from "../services/articleService";
// Componentes
import { SelectPicker } from "./SelectPicker";
import { ArticleMapView } from "./ArticleMapView";

const sanitizePriceInput = (value: string): string => value.replace(/\D/g, "");

const parsePrice = (value?: string): number | undefined => {
  if (!value || value.trim().length === 0) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

type ProductSelectionNav = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

type ProductSelectionModalProps = {
  visible: boolean;
  onDismiss: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  categoryOptions?: { label: string; value: string }[];
  selectedCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  conditionOptions?: { label: string; value: string }[];
  selectedCondition?: string;
  onConditionChange?: (condition: string) => void;
  minPrice?: string;
  maxPrice?: string;
  onMinPriceChange?: (value: string) => void;
  onMaxPriceChange?: (value: string) => void;
  onClearFilters?: () => void;
  categoryFilter?: "ALL" | string;
  onCategoryFilterChange?: (category: "ALL" | string) => void;
  categories?: string[];
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
  targetCityCoords?: { lat: number; lng: number } | null;
  mapProducts?: {
    id: number;
    title: string;
    city?: string | null;
    pricePerMonth: number;
    ownerName?: string | null;
    distanceKm?: number;
    cityLat?: number;
    cityLng?: number;
    availableFrom?: string | null;
    availableUntil?: string | null;
  }[];
};

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onDismiss,
  searchText,
  onSearchChange,
  categoryOptions,
  selectedCategoryId,
  onCategoryChange,
  conditionOptions,
  selectedCondition,
  onConditionChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearFilters,
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
  targetCityCoords,
  mapProducts = [],
}) => {
  const navigation = useNavigation<ProductSelectionNav>();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [mapView, setMapView] = React.useState(false);
  const [requestingIds, setRequestingIds] = React.useState<
    Record<number, boolean>
  >({});
  const filteredProductIds = React.useMemo(
    () => new Set(filteredProducts.map((product) => product.id)),
    [filteredProducts],
  );
  const resolvedCategoryOptions = React.useMemo(() => {
    if (categoryOptions && categoryOptions.length > 0) {
      return categoryOptions;
    }

    return (categories ?? []).map((category) => ({
      label: category === "ALL" ? "Todas las categorías" : category,
      value: category,
    }));
  }, [categories, categoryOptions]);
  const resolvedSelectedCategoryId = selectedCategoryId ?? categoryFilter ?? "";
  const resolvedSelectedCondition = selectedCondition ?? "";
  const resolvedConditionOptions = conditionOptions ?? [
    { label: "Cualquier estado", value: "" },
  ];
  const [priceValidationError, setPriceValidationError] =
    React.useState<string>("");

  const minPriceValue = React.useMemo(() => parsePrice(minPrice), [minPrice]);
  const maxPriceValue = React.useMemo(() => parsePrice(maxPrice), [maxPrice]);

  const minPriceError = React.useMemo(() => {
    if (!minPrice || minPrice.trim().length === 0) return "";
    if (minPriceValue === undefined) return "Introduce solo numeros.";
    if (minPriceValue < 1) return "El precio minimo debe ser al menos 1 EUR.";
    return "";
  }, [minPrice, minPriceValue]);

  const maxPriceError = React.useMemo(() => {
    if (!maxPrice || maxPrice.trim().length === 0) return "";
    if (maxPriceValue === undefined) return "Introduce solo numeros.";
    if (maxPriceValue < 1) return "El precio maximo debe ser al menos 1 EUR.";
    return "";
  }, [maxPrice, maxPriceValue]);

  const rangePriceError = React.useMemo(() => {
    if (minPriceValue === undefined || maxPriceValue === undefined) return "";
    if (maxPriceValue < minPriceValue) {
      return "El precio maximo debe ser mayor o igual al minimo.";
    }
    return "";
  }, [minPriceValue, maxPriceValue]);

  const handleMinPriceInput = (value: string) => {
    setPriceValidationError("");
    (onMinPriceChange ?? (() => {}))(sanitizePriceInput(value));
  };

  const handleMaxPriceInput = (value: string) => {
    setPriceValidationError("");
    (onMaxPriceChange ?? (() => {}))(sanitizePriceInput(value));
  };

  const handleCategorySelection = (value: string) => {
    if (onCategoryChange) {
      onCategoryChange(value);
      return;
    }
    if (onCategoryFilterChange) {
      onCategoryFilterChange((value || "ALL") as "ALL" | string);
    }
  };

  const handleRequestAvailability = async (articleId: number) => {
    if (!user?.id || !user.token) {
      showNotification(
        "Necesitas iniciar sesión para solicitar el aviso.",
        "error",
      );
      return;
    }

    if (requestingIds[articleId]) return;
    setRequestingIds((prev) => ({ ...prev, [articleId]: true }));

    try {
      await requestArticleAvailabilityNotification(
        articleId,
        user.id,
        user.token,
      );
      showNotification(
        "Te avisaremos cuando el artículo vuelva a estar disponible.",
        "success",
      );
    } catch (error) {
      showNotification(
        error instanceof Error
          ? error.message
          : "No se pudo solicitar el aviso.",
        "error",
      );
    } finally {
      setRequestingIds((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  // Calcular disponibilidad de productos basado en fechas para la LISTA
  const productsWithAvailability = React.useMemo(() => {
    if (!startDate || !endDate) {
      return filteredProducts.map((p) => ({ ...p, isAvailable: true }));
    }

    const requestStart = new Date(startDate);
    requestStart.setHours(0, 0, 0, 0);

    const requestEnd = new Date(endDate);
    requestEnd.setHours(0, 0, 0, 0);

    const mapped = filteredProducts.map((p) => {
      if (!p.availableFrom || !p.availableUntil) {
        const isAvailable = p.status === "AVAILABLE" || p.status === "ACTIVE";
        return {
          ...p,
          isAvailable,
          availabilityMessage: isAvailable
            ? undefined
            : "Sin fechas de disponibilidad",
        };
      }

      const productFrom = new Date(p.availableFrom);
      productFrom.setHours(0, 0, 0, 0);

      const productUntil = new Date(p.availableUntil);
      productUntil.setHours(0, 0, 0, 0);

      const isAvailable =
        requestStart >= productFrom && requestEnd <= productUntil;

      if (!isAvailable) {
        const formatDate = (date: Date) => {
          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        };
        const availabilityMessage = `Disponible: ${formatDate(productFrom)} - ${formatDate(productUntil)}`;
        return { ...p, isAvailable: false, availabilityMessage };
      }

      return { ...p, isAvailable: true };
    });

    if (showOnlyAvailable) {
      return mapped.filter((p) => p.isAvailable === true);
    }

    return mapped;
  }, [filteredProducts, startDate, endDate, showOnlyAvailable]);

  // Productos para el mapa (con marca de disponibilidad, sin filtrar)
  const mapProductsWithAvailability = React.useMemo(() => {
    let products = (
      showOnlyMyCity && userCity
        ? mapProducts.filter(
            (a) =>
              filteredProductIds.has(a.id) &&
              a.city?.toLowerCase() === userCity.toLowerCase(),
          )
        : mapProducts.filter((a) => filteredProductIds.has(a.id))
    ).map((a) => ({
      ...a,
      city: a.city ?? undefined,
      ownerName: a.ownerName ?? undefined,
    }));

    if (!startDate || !endDate) {
      return products;
    }

    const requestStart = new Date(startDate);
    requestStart.setHours(0, 0, 0, 0);

    const requestEnd = new Date(endDate);
    requestEnd.setHours(0, 0, 0, 0);

    const processedProducts = products.map((product) => {
      if (!product.availableFrom || !product.availableUntil) {
        return { ...product, isAvailableForDates: false };
      }

      const productFrom = new Date(product.availableFrom);
      productFrom.setHours(0, 0, 0, 0);

      const productUntil = new Date(product.availableUntil);
      productUntil.setHours(0, 0, 0, 0);

      const isAvailable =
        requestStart >= productFrom && requestEnd <= productUntil;

      return { ...product, isAvailableForDates: isAvailable };
    });

    if (showOnlyAvailable) {
      return processedProducts.filter((p) => p.isAvailableForDates === true);
    }

    return processedProducts;
  }, [
    mapProducts,
    filteredProductIds,
    showOnlyMyCity,
    userCity,
    startDate,
    endDate,
    showOnlyAvailable,
  ]);

  const navigateToUserReviews = (ownerId: number, ownerName: string) => {
    onDismiss();
    navigation.navigate("UserRatings", {
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

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <SelectPicker
                    options={resolvedCategoryOptions}
                    selectedValue={resolvedSelectedCategoryId}
                    placeholder="Todas las categorías"
                    onValueChange={handleCategorySelection}
                    title="Filtrar por categoría"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <SelectPicker
                    options={resolvedConditionOptions}
                    selectedValue={resolvedSelectedCondition}
                    placeholder="Cualquier estado"
                    onValueChange={onConditionChange ?? (() => {})}
                    title="Filtrar por estado"
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <PaperTextInput
                  mode="outlined"
                  label="Precio mín."
                  value={minPrice ?? ""}
                  onChangeText={handleMinPriceInput}
                  keyboardType="numeric"
                  error={
                    !!minPriceError ||
                    !!rangePriceError ||
                    !!priceValidationError
                  }
                  style={{ flex: 1, backgroundColor: Colors.backgroundWhite }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                />
                <PaperTextInput
                  mode="outlined"
                  label="Precio máx."
                  value={maxPrice ?? ""}
                  onChangeText={handleMaxPriceInput}
                  keyboardType="numeric"
                  error={
                    !!maxPriceError ||
                    !!rangePriceError ||
                    !!priceValidationError
                  }
                  style={{ flex: 1, backgroundColor: Colors.backgroundWhite }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                />
              </View>

              {!!minPriceError && (
                <Text style={commonStyles.errorText}>{minPriceError}</Text>
              )}
              {!!maxPriceError && (
                <Text style={commonStyles.errorText}>{maxPriceError}</Text>
              )}
              {!!rangePriceError && (
                <Text style={commonStyles.errorText}>{rangePriceError}</Text>
              )}
              {!!priceValidationError && (
                <Text style={commonStyles.errorText}>
                  {priceValidationError}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setPriceValidationError("");
                    (onClearFilters ?? (() => {}))();
                  }}
                  style={{ flex: 1, borderRadius: 8 }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  Limpiar
                </Button>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setMapView(false)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: !mapView ? Colors.primary : Colors.border,
                  backgroundColor: !mapView
                    ? "#E3F2FD"
                    : Colors.backgroundWhite,
                }}
              >
                <Ionicons
                  name="list-outline"
                  size={18}
                  color={!mapView ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={{
                    color: !mapView ? Colors.primary : Colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  Lista
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMapView(true)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: mapView ? Colors.primary : Colors.border,
                  backgroundColor: mapView ? "#E3F2FD" : Colors.backgroundWhite,
                }}
              >
                <Ionicons
                  name="map-outline"
                  size={18}
                  color={mapView ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={{
                    color: mapView ? Colors.primary : Colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  Mapa
                </Text>
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
          </View>

          {mapView ? (
            <ArticleMapView
              articles={mapProductsWithAvailability}
              targetCityCoords={targetCityCoords ?? null}
              userCity={userCity}
              selectedIds={Object.keys(tempSelectedQuantities).map(Number)}
              onAddArticle={onToggleSelection}
            />
          ) : null}

          <ScrollView
            style={[createKitStyles.modalList, mapView ? { height: 0 } : {}]}
          >
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
                const isRentableStatus =
                  p.status === "AVAILABLE" || p.status === "ACTIVE";
                const canBeAdded = p.isAvailable && isRentableStatus;

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
                            onPress={() => {
                              navigateToUserReviews(
                                p.ownerId,
                                p.ownerName || "",
                              );
                            }}
                          >
                            {`${p.ownerName}`}
                            {" • "}
                          </Text>
                        ) : (
                          ""
                        )}
                        {p.city ? `${p.city}` : ""}
                        {p.distanceKm !== undefined ? (
                          <Text
                            style={{ color: "#F57F17" }}
                          >{` · ~${p.distanceKm} km`}</Text>
                        ) : null}
                        {p.category ? ` · ${p.category}` : ""}
                      </Text>
                      {p.condition ? (
                        <Text style={commonStyles.caption}>
                          Estado:{" "}
                          {p.condition === "NEW"
                            ? "Nuevo"
                            : p.condition === "LIGHTLY_USED"
                              ? "Poco usado"
                              : p.condition === "USED"
                                ? "Usado"
                                : p.condition === "WORN"
                                  ? "Desgastado"
                                  : p.condition}
                        </Text>
                      ) : null}
                      <Text style={commonStyles.caption}>
                        Unidades disponibles: {p.totalUnits}
                      </Text>
                      {p.availabilityMessage && (
                        <Text
                          style={[
                            commonStyles.caption,
                            {
                              color: p.isAvailable
                                ? Colors.textSecondary
                                : Colors.error,
                              marginTop: 2,
                            },
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

                    {canBeAdded ? (
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={checked ? Colors.success : Colors.primary}
                      />
                    ) : (
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          width: 45,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => handleRequestAvailability(p.id)}
                          disabled={requestingIds[p.id]}
                          accessibilityRole="button"
                          accessibilityLabel={`Avisar cuando ${p.title} esté disponible`}
                        >
                          {requestingIds[p.id] ? (
                            <ActivityIndicator
                              size="small"
                              color={Colors.warning}
                            />
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
                            textAlign: "center",
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
              Añadir ({Object.keys(tempSelectedQuantities).length})
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
