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

export type PresetCatalogProduct = {
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
};

type PresetProductSelectionModalProps = {
  visible: boolean;
  onDismiss: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  categoryFilter: "ALL" | string;
  onCategoryFilterChange: (category: "ALL" | string) => void;
  categories: string[];
  filteredProducts: PresetCatalogProduct[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onConfirm: () => void;
  userCity?: string;
  showOnlyMyCity: boolean;
  onToggleMyCity: (show: boolean) => void;
};

export const PresetProductSelectionModal: React.FC<
  PresetProductSelectionModalProps
> = ({
  visible,
  onDismiss,
  searchText,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  filteredProducts,
  selectedIds,
  onToggleSelection,
  onConfirm,
  userCity,
  showOnlyMyCity,
  onToggleMyCity,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={createKitStyles.modalOverlay}>
        <View style={createKitStyles.modalCard}>
          <Text style={[createKitStyles.modalTitle, { color: Colors.primaryHome }]}
          >
            Añadir productos
          </Text>

          <View style={{ gap: 8, marginBottom: 12 }}>
            <PaperTextInput
              mode="outlined"
              label="Busca un artículo o servicio"
              value={searchText}
              onChangeText={onSearchChange}
              left={<PaperTextInput.Icon icon="magnify" />}
              style={{ backgroundColor: Colors.backgroundWhite }}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primaryHome}
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
                    ? Colors.secondaryBlue
                    : Colors.backgroundWhite,
                  borderWidth: 1,
                  borderColor: showOnlyMyCity ? Colors.primaryHome : Colors.border,
                  gap: 8,
                }}
              >
                <Ionicons
                  name={showOnlyMyCity ? "checkbox" : "square-outline"}
                  size={20}
                  color={Colors.primaryHome}
                />
                <Text style={{ color: Colors.primaryHome, flex: 1 }}>
                  Solo productos en {userCity}
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
                      categoryFilter === c ? Colors.primaryHome : Colors.border,
                    backgroundColor:
                      categoryFilter === c
                        ? Colors.secondaryLavender
                        : Colors.backgroundWhite,
                  }}
                >
                  <Text style={{ color: Colors.primaryHome }}>
                    {c === "ALL" ? "Todas las categorías" : c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={createKitStyles.modalList}>
            {filteredProducts.length === 0 ? (
              <Text
                style={[
                  commonStyles.bodySecondary,
                  { textAlign: "center", marginTop: 10, marginBottom: 20 },
                ]}
              >
                No hay productos que cumplan los filtros.
              </Text>
            ) : (
              filteredProducts.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    style={createKitStyles.modalRow}
                    onPress={() => onToggleSelection(p.id)}
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
                      <Text
                        style={[
                          createKitStyles.productTitle,
                          { color: Colors.primaryHome },
                        ]}
                      >
                        {p.title}
                      </Text>
                      <Text style={commonStyles.caption}>
                        {p.city ? `${p.city} · ` : ""}
                        {p.category ? `${p.category}` : ""}
                      </Text>
                      <Text style={commonStyles.caption}>
                        Unidades disponibles: {p.totalUnits}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text
                        style={[
                          createKitStyles.productTitle,
                          { color: Colors.primaryHome },
                        ]}
                      >
                        {p.pricePerMonth?.toFixed(2)}€
                      </Text>
                      <Text style={commonStyles.bodySecondary}>/ mes</Text>
                    </View>

                    <Ionicons
                      name={checked ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={checked ? Colors.success : Colors.primaryHome}
                    />
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
