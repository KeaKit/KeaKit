import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Modal, Text } from "react-native-paper";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { es, registerTranslation } from "react-native-paper-dates";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  TextInput as PaperTextInput,
  Button,
  Portal,
} from "react-native-paper";

registerTranslation("es", es);

import { useAuth } from "../../context/AuthContext";
import { API_ROUTES } from "../../config/api";
import { RootStackParamList, DefaultKitCreateRequest } from "../../types";
import { Colors, commonStyles, componentStyles } from "../../styles";
import { createKitStyles } from "../../styles/createKitStyles";
import { ProductSelectionModal } from "../../components/ProductSelectionModal";
import {
  removeSelectedQuantity,
  upsertSelectedQuantity
} from "../kit/createKitSelection";
import { createDefaultKit, updateDefaultKit } from "../../services/defaultKitService";
import { categoryFormScreenStyles } from '../../styles/categoryFormScreenStyles';
import DefaultKitItemComponent from "../../components/DefaultKitItemComponent";

const { saveButton, saveButtonText, editButton } = categoryFormScreenStyles;

type CreateDefaultKitNav = NativeStackNavigationProp<RootStackParamList, "DefaultKitForm">;
type DefaultKitFormRoute = RouteProp<RootStackParamList, 'DefaultKitForm'>;

type CatalogProduct = {
  id: number;
  itemType: "ARTICLE" | "SERVICE" | string;
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
};

const DefaultKitFormScreen: React.FC = () => {
  const navigation = useNavigation<CreateDefaultKitNav>();
  const route = useRoute<DefaultKitFormRoute>();

  const { user } = useAuth();

  const initialMode = route.params?.mode || 'create';
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const defaultKitToEdit = route.params?.defaultKit;

  const [name, setName] = useState(defaultKitToEdit?.name || "");
  const [description, setDescription] = useState(defaultKitToEdit?.description || "");
  const [availableProducts, setAvailableProducts] = useState<CatalogProduct[]>([]);
  
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [tempSelectedQuantities, setTempSelectedQuantities] = useState<Record<number, number>>({});

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const isEditable = formMode !== 'view';

  const showErrorModal = (message: string) => {
    setError(message);
    setErrorModalVisible(true);
  };

  const loadCatalog = useCallback(async () => {
    if (!user?.token) {
      setAvailableProducts([]);
      setLoadingCatalog(false);
      showErrorModal("Necesitas iniciar sesión.");
      return;
    }

    try {
      setLoadingCatalog(true);
      const res = await fetch(API_ROUTES.ITEMS_FOR_RENT(user.id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      const mapped: CatalogProduct[] = (raw ?? []).map((p: any) => ({
        id: Number(p.id),
        itemType: String(p.itemType ?? "ARTICLE"),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"),
        category: typeof p.category === "string" ? p.category : (p.category?.name ?? ""),
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: p.imageUrl ?? null,
        totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
      }));

      setAvailableProducts(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el catálogo.";
      showErrorModal(message);
      setAvailableProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (defaultKitToEdit && defaultKitToEdit.items) {
      const initialQuantities: Record<number, number> = {};
      defaultKitToEdit.items.forEach(kitItem => {
        const itemId = kitItem.item?.id;
        if (itemId) {
          initialQuantities[itemId] = (initialQuantities[itemId] || 0) + 1;
        }
      });
      setSelectedQuantities(initialQuantities);
    }
  }, [defaultKitToEdit]);

  const selectedIds = useMemo(() => Object.keys(selectedQuantities).map(Number), [selectedQuantities]);
  
  const selectedProducts = useMemo(
    () => availableProducts.filter((p) => selectedIds.includes(p.id)),
    [availableProducts, selectedIds]
  );

  const selectedItemsCount = useMemo(
    () => Object.values(selectedQuantities).reduce((sum, quantity) => sum + quantity, 0),
    [selectedQuantities]
  );

  const categories = useMemo(() => {
    const set = new Set(availableProducts.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)));
    return ["ALL", ...Array.from(set)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return availableProducts.filter((p) => {
      const notInactive = p.itemType === "SERVICE" || p.status !== "INACTIVE";
      const byCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const bySearch = q.length === 0 || p.title.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q);
      return notInactive && byCategory && bySearch;
    });
  }, [availableProducts, searchText, categoryFilter]);

  const openAddProductModal = () => {
    setTempSelectedQuantities(selectedQuantities);
    setSearchText("");
    setCategoryFilter("ALL");
    setCatalogModalVisible(true);
  };

  const toggleTempSelection = (id: number) => {
    setTempSelectedQuantities((prev) => {
      const isSelected = Object.prototype.hasOwnProperty.call(prev, id);
      if (isSelected) return removeSelectedQuantity(prev, id);
      return upsertSelectedQuantity(prev, id, 1);
    });
  };

  const changeTempQuantity = (id: number, nextQuantity: number, maxQuantity: number) => {
    const safeQuantity = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    setTempSelectedQuantities((prev) => upsertSelectedQuantity(prev, id, safeQuantity));
  };

  const confirmSelection = () => {
    setSelectedQuantities(tempSelectedQuantities);
    setCatalogModalVisible(false);
  };

  const removeSelectedItem = (id: number) => {
    if (!isEditable) return;
    setSelectedQuantities((prev) => removeSelectedQuantity(prev, id));
  };

  const incrementSelectedQuantity = (id: number) => {
    if (!isEditable) return;
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    const current = selectedQuantities[id] ?? 1;
    setSelectedQuantities((prev) => upsertSelectedQuantity(prev, id, Math.min(current + 1, product.totalUnits)));
  };

  const decrementSelectedQuantity = (id: number) => {
    if (!isEditable) return;
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    const current = selectedQuantities[id] ?? 1;
    setSelectedQuantities((prev) => upsertSelectedQuantity(prev, id, Math.max(current - 1, 1)));
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.token) {
      showErrorModal("Necesitas iniciar sesión para crear un kit.");
      return;
    }
    if (!name || !description || selectedProducts.length === 0) {
      showErrorModal("Error: Por favor rellena todos los campos y añade al menos un producto.");
      return;
    }

    try {
      setSubmitting(true);

      // Convertimos el objeto de cantidades {itemId: cantidad} en una lista plana de IDs [1, 1, 2]
      const itemIds: number[] = [];
      Object.entries(selectedQuantities).forEach(([id, qty]) => {
        for (let i = 0; i < qty; i++) {
          itemIds.push(Number(id));
        }
      });

      const payload: DefaultKitCreateRequest = { 
        name, 
        description, 
        itemsIds: itemIds // Asegúrate de que el nombre coincida con el DTO (itemsIds)
      };
      
      const successMessage = formMode === 'edit' ? 'Kit predeterminado actualizado' : 'Kit predeterminado creado';

      if (formMode === 'edit' && defaultKitToEdit) {
        await updateDefaultKit(defaultKitToEdit.id, payload, user.token);
      } else {
        await createDefaultKit(payload, user.token);
      }

      if (Platform.OS === 'web') {
        window.alert(successMessage);
        navigation.goBack();
      } else {
        Alert.alert('Éxito', successMessage, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showErrorModal("ERROR al guardar kit: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    if (formMode === 'view') return 'Detalles del Kit';
    if (formMode === 'edit') return 'Editar Kit';
    return 'Crear Kit Predeterminado';
  };

  const customTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.primary,
      onPrimary: "#FFFFFF",
      primaryContainer: "#E3F2FD",
      onPrimaryContainer: Colors.primary,
      surface: "#FFFFFF",
      onSurface: "#1C1B1F",
      surfaceVariant: "#E7E0EC",
      onSurfaceVariant: "#49454F",
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <View style={commonStyles.container}>
        <ScrollView contentContainerStyle={createKitStyles.content} keyboardShouldPersistTaps="handled">
          
          {/* HEADER */}
          <View style={createKitStyles.headerRow}>
            <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={[commonStyles.headerTitle, createKitStyles.headerTitle]}>
              {getHeaderTitle()}
            </Text>
            <View style={componentStyles.iconButton} />
          </View>

          {/* FORMULARIO */}
          <PaperTextInput
            mode="outlined"
            label="Nombre del Kit"
            value={name}
            onChangeText={setName}
            editable={isEditable}
            style={{ backgroundColor: Colors.backgroundWhite, marginBottom: 12 }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />
          <PaperTextInput
            mode="outlined"
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            editable={isEditable}
            multiline
            style={{ backgroundColor: Colors.backgroundWhite }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />

          {/* SECCIÓN DE PRODUCTOS */}
          <View style={createKitStyles.productsHeader}>
            <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>
              Productos incluidos
            </Text>
            {isEditable && (
              <Button
                mode="contained"
                onPress={openAddProductModal}
                icon="plus"
                compact
                style={{ borderRadius: 8 }}
              >
                Añadir Producto
              </Button>
            )}
          </View>

          <View style={createKitStyles.counterBadge}>
            <Text style={createKitStyles.counterBadgeText}>
              Seleccionados: {selectedItemsCount}
            </Text>
          </View>

          {loadingCatalog ? (
            <View style={createKitStyles.loaderArea}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : selectedProducts.length === 0 ? (
            <Text style={commonStyles.bodySecondary}>
              Aún no hay productos en este kit.
            </Text>
          ) : (
            selectedProducts.map((item) => (
              <DefaultKitItemComponent
                key={item.id}
                item={item}
                quantity={selectedQuantities[item.id] ?? 1}
                maxQuantity={item.totalUnits}
                onIncrease={isEditable ? incrementSelectedQuantity : undefined}
                onDecrease={isEditable ? decrementSelectedQuantity : undefined}
                onRemove={isEditable ? removeSelectedItem : undefined}
              />
            ))
          )}
        </ScrollView>

        {/* FOOTER BOTONES */}
        <View style={{ padding: 16, backgroundColor: Colors.backgroundWhite }}>
          {formMode === 'view' ? (
            <TouchableOpacity style={editButton} onPress={() => setFormMode('edit')}>
              <Ionicons name="pencil" size={18} color={Colors.textWhite} style={{ marginRight: 6 }} />
              <Text style={saveButtonText}>Editar Kit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={saveButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={Colors.textWhite} size="small" />
              ) : (
                <Text style={saveButtonText}>
                  {formMode === 'edit' ? 'Confirmar cambios' : 'Crear kit predeterminado'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <ProductSelectionModal
          visible={catalogModalVisible}
          onDismiss={() => setCatalogModalVisible(false)}
          searchText={searchText}
          onSearchChange={setSearchText}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
          filteredProducts={filteredProducts}
          tempSelectedQuantities={tempSelectedQuantities}
          onToggleSelection={toggleTempSelection}
          onChangeQuantity={changeTempQuantity}
          onConfirm={confirmSelection}
          showOnlyMyCity={showOnlyMyCity}
          onToggleMyCity={setShowOnlyMyCity}
          showOnlyAvailable={showOnlyAvailable}
          onToggleAvailable={setShowOnlyAvailable}
          expandedSearch={false}
          onToggleExpandedSearch={() => {}}
          loadingNearby={false}
        />
      </View>

      <Portal>
        <Modal
          visible={errorModalVisible}
          onDismiss={() => setErrorModalVisible(false)}
          contentContainerStyle={commonStyles.errorContainer}
        >
          <Text variant="titleMedium" style={commonStyles.subtitle}>Error</Text>
          <Text style={commonStyles.errorText}>{error ?? "Ha ocurrido un error."}</Text>
          <Button
            mode="contained"
            onPress={() => setErrorModalVisible(false)}
            style={commonStyles.primaryButton}
            buttonColor="#1A3A52"
            textColor="#FFFFFF"
          >
            Entendido
          </Button>
        </Modal>
      </Portal>
    </PaperProvider>
  );
};

export default DefaultKitFormScreen;