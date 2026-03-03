import React from "react";
import {
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

type CatalogProduct = {
  id: number;
  title: string;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | string;
  category?: string;
  city?: string;
  ownerName?: string;
  imageUrl?: string | null;
  totalUnits: number;
  availableFrom?: string;
  availableUntil?: string;
  isAvailable?: boolean;
  availabilityMessage?: string;
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
}) => {
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

          <ScrollView style={createKitStyles.modalList}>
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
                const isDisabled = p.isAvailable === false;
                return (
                  <Pressable
                    key={p.id}
                    style={[
                      createKitStyles.modalRow,
                      checked && createKitStyles.modalRowChecked,
                      isDisabled && {
                        opacity: 0.7,
                        backgroundColor: "#fafafa",
                      },
                    ]}
                    onPress={() => !isDisabled && onToggleSelection(p.id)}
                    disabled={isDisabled}
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
                        {p.ownerName ? `${p.ownerName} · ` : ""}
                        {p.city ? `${p.city} · ` : ""}
                        {p.category ? `${p.category}` : ""}
                      </Text>
                      <Text style={commonStyles.caption}>
                        Unidades disponibles: {p.totalUnits}
                      </Text>
                      {p.availabilityMessage && (
                        <Text
                          style={[
                            commonStyles.caption,
                            { color: Colors.textSecondary, marginTop: 2 },
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
                      {checked ? (
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
                    {!isDisabled && (
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={checked ? Colors.success : Colors.primary}
                      />
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
