import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Text } from "react-native-paper";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  TextInput as PaperTextInput,
} from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";

import {
  FontWeights,
  FontSizes,
  BorderRadius,
  Colors,
  commonStyles,
  Spacing,
} from "../../../styles";
import { RootStackParamList, DefaultKitCreateRequest, ArticleNearby } from "../../../types";
import {
  removeSelectedQuantity,
  upsertSelectedQuantity,
} from "../../kit/createKitSelection";
import {
  Header,
  KeakitButton,
  KeakitModal,
  DefaultKitItemComponent,
  ProductSelectionModal,
} from "../../../components";
import {
  createDefaultKit,
  updateDefaultKit,
} from "../../../services/defaultKitService";
import { fetchItemsForRent } from "../../../services/itemService";
import { getArticlesForMap } from "../../../services/articleService";
import { Helmet } from 'react-helmet-async'; 

type CreateDefaultKitNav = NativeStackNavigationProp<
  RootStackParamList,
  "DefaultKitForm"
>;
type DefaultKitFormRoute = RouteProp<RootStackParamList, "DefaultKitForm">;

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
  const token = user?.token || null;
  const mode = route.params?.mode || "create";
  const defaultKitToEdit = route.params?.defaultKit;

  const [name, setName] = useState(defaultKitToEdit?.name || "");
  const [description, setDescription] = useState(
    defaultKitToEdit?.description || "",
  );
  const [availableProducts, setAvailableProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<number, number>
  >({});
  const [tempSelectedQuantities, setTempSelectedQuantities] = useState<
    Record<number, number>
  >({});

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mapProducts, setMapProducts] = useState<ArticleNearby[]>([]);

  const loadCatalog = useCallback(async () => {
    if (!user?.id || !token) {
      setAvailableProducts([]);
      setLoadingCatalog(false);
      setError("Necesitas iniciar sesión.");
      return;
    }

    try {
      setLoadingCatalog(true);
      const res = await fetchItemsForRent(user.id, token);

      const mapped: CatalogProduct[] = res.map((p: any) => ({
        id: Number(p.id),
        itemType: String(p.itemType ?? "ARTICLE"),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"),
        category:
          typeof p.category === "string"
            ? p.category
            : (p.category?.name ?? ""),
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: p.imageUrl ?? null,
        totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
      }));

      setAvailableProducts(mapped);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catálogo.";
      setError(message);
      setAvailableProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (defaultKitToEdit && defaultKitToEdit.items) {
      const initialQuantities: Record<number, number> = {};
      defaultKitToEdit.items.forEach((kitItem) => {
        const itemId = kitItem.item?.id;
        if (itemId) {
          initialQuantities[itemId] = (initialQuantities[itemId] || 0) + 1;
        }
      });
      setSelectedQuantities(initialQuantities);
    }
  }, [defaultKitToEdit]);

  const selectedIds = useMemo(
    () => Object.keys(selectedQuantities).map(Number),
    [selectedQuantities],
  );

  const selectedProducts = useMemo(
    () => availableProducts.filter((p) => selectedIds.includes(p.id)),
    [availableProducts, selectedIds],
  );

  const selectedItemsCount = useMemo(
    () =>
      Object.values(selectedQuantities).reduce(
        (sum, quantity) => sum + quantity,
        0,
      ),
    [selectedQuantities],
  );

  const categories = useMemo(() => {
    const set = new Set(
      availableProducts
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c)),
    );
    return ["ALL", ...Array.from(set)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const minP = minPrice ? parseFloat(minPrice) : 0;
    const maxP = maxPrice ? parseFloat(maxPrice) : 2000;
    return availableProducts.filter((p) => {
      const notInactive = p.itemType === "SERVICE" || p.status !== "INACTIVE";
      const byCategory =
        categoryFilter === "ALL" || p.category === categoryFilter;
      const bySearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);
      const byPrice = p.pricePerMonth >= minP && p.pricePerMonth <= maxP;
      return notInactive && byCategory && bySearch && byPrice;
    });
  }, [availableProducts, searchText, categoryFilter, minPrice, maxPrice]);

  const openAddProductModal = async () => {
    setTempSelectedQuantities(selectedQuantities);
    setSearchText("");
    setShowOnlyAvailable(true);

    if (user?.token) {
      try {
        const mapData = await getArticlesForMap(user.token, undefined);
        setMapProducts(mapData);
      } catch (error) {
        console.warn('Error al cargar productos del mapa:', error);
        setMapProducts([]);
      }
    } else {
      setMapProducts([]);
    }

    setCatalogModalVisible(true);
  };

  const toggleTempSelection = (id: number) => {
    setTempSelectedQuantities((prev) => {
      const isSelected = Object.prototype.hasOwnProperty.call(prev, id);
      if (isSelected) return removeSelectedQuantity(prev, id);
      return upsertSelectedQuantity(prev, id, 1);
    });
  };

  const changeTempQuantity = (
    id: number,
    nextQuantity: number,
    maxQuantity: number,
  ) => {
    const safeQuantity = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    setTempSelectedQuantities((prev) =>
      upsertSelectedQuantity(prev, id, safeQuantity),
    );
  };

  const confirmSelection = () => {
    setSelectedQuantities(tempSelectedQuantities);
    setCatalogModalVisible(false);
  };

  const removeSelectedItem = (id: number) => {
    setSelectedQuantities((prev) => removeSelectedQuantity(prev, id));
  };

  const incrementSelectedQuantity = (id: number) => {
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    // eslint-disable-next-line security/detect-object-injection
    const current = selectedQuantities[id] ?? 1;
    setSelectedQuantities((prev) =>
      upsertSelectedQuantity(
        prev,
        id,
        Math.min(current + 1, product.totalUnits),
      ),
    );
  };

  const decrementSelectedQuantity = (id: number) => {
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    const current = selectedQuantities[id] ?? 1;
    setSelectedQuantities((prev) =>
      upsertSelectedQuantity(prev, id, Math.max(current - 1, 1)),
    );
  };

  const handleSubmit = async () => {
    if (!user?.id || !token) {
      setError("Necesitas iniciar sesión para crear un kit.");
      return;
    }
    if (!name || !description || selectedProducts.length === 0) {
      setError(
        "Error: Por favor rellena todos los campos y añade al menos un producto.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const itemIds: number[] = [];
      Object.entries(selectedQuantities).forEach(([id, qty]) => {
        for (let i = 0; i < qty; i++) itemIds.push(Number(id));
      });

      const payload: Partial<DefaultKitCreateRequest> = {
        name,
        description,
        itemsIds: itemIds,
      };

      const successMessage =
        mode === "edit"
          ? "Kit predeterminado actualizado correctamente."
          : "Kit predeterminado creado correctamente.";

      if (mode === "edit" && defaultKitToEdit) {
        await updateDefaultKit(defaultKitToEdit.id, payload, token);
      } else {
        await createDefaultKit(payload, token);
      }

      setSuccessMessage(successMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError("Error al guardar kit: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
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

  const getHelmetTitle = () => {
    return mode === "edit"
      ? "Editar kit predeterminado"
      : "Crear kit predeterminado";
  };

  const getMetaDescription = () => {
    if (mode === "edit") {
      return "Edita un kit predeterminado y gestiona los productos incluidos en KeaKit.";
    }

    return "Crea un kit predeterminado seleccionando productos y configurando su contenido en KeaKit.";
  };

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.containerWhite}>
          <Helmet>
          <title>{getHelmetTitle()} | Keakit</title>
          <meta name="description" content={getMetaDescription()} />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>        
        <Header
          title={mode === "edit" ? "Editar Kit" : "Crear Kit Predeterminado"}
          showBack
          onBack={() => navigation.goBack()}
        />
        <KeakitModal
          visible={!!error}
          onDismiss={() => {
            setError(null);
          }}
          message={error ?? "Ha ocurrido un error."}
          variant="error"
        />
        <KeakitModal
          visible={!!successMessage}
          onDismiss={() => {
            setSuccessMessage(null);
            navigation.goBack();
          }}
          message={successMessage ?? "Operación exitosa."}
          variant="info"
        />
        <View style={commonStyles.contentContainer}>
          {/* FORMULARIO */}
          <PaperTextInput
            mode="outlined"
            label="Nombre del Kit"
            value={name}
            onChangeText={setName}
            style={{ backgroundColor: Colors.backgroundWhite }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />
          <PaperTextInput
            mode="outlined"
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ backgroundColor: Colors.backgroundWhite }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />

          {/* SECCIÓN DE PRODUCTOS */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: Spacing.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.sm,
              }}
            >
              <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>
                Productos seleccionados
              </Text>
              <View style={styles.statCircle}>
                <Text style={styles.statNumber}>{selectedItemsCount}</Text>
              </View>
            </View>

            <View style={{ minWidth: 165 }}>
              <KeakitButton
                title="Añadir productos"
                onPress={openAddProductModal}
                icon="plus"
              />
            </View>
          </View>

          {loadingCatalog ? (
            <View
              style={{
                paddingVertical: Spacing.xl,
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : selectedProducts.length === 0 ? (
            <Text
              style={[
                commonStyles.bodySecondary,
                { flex: 1, textAlign: "center", marginTop: 50 },
              ]}
            >
              Aún no hay productos en este kit.
            </Text>
          ) : (
            <FlatList
              data={selectedProducts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DefaultKitItemComponent
                  key={item.id}
                  item={item}
                  quantity={selectedQuantities[item.id] ?? 1}
                  maxQuantity={item.totalUnits}
                  onIncrease={incrementSelectedQuantity}
                  onDecrease={decrementSelectedQuantity}
                  onRemove={removeSelectedItem}
                />
              )}
              contentContainerStyle={{ gap: Spacing.sm, flex: 1 }}
            />
          )}
        </View>

        {/* FOOTER */}
        <View style={commonStyles.footerContainer}>
          <KeakitButton
            title={
              mode === "edit" ? "Confirmar cambios" : "Crear kit predeterminado"
            }
            onPress={async () => { await handleSubmit(); }}
            icon={"check"}
            loading={submitting}
            disabled={submitting}
          />
        </View>

        <ProductSelectionModal
          visible={catalogModalVisible}
          onDismiss={() => { setCatalogModalVisible(false); }}
          searchText={searchText}
          onSearchChange={setSearchText}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onClearFilters={() => {
            setSearchText("");
            setCategoryFilter("ALL");
            setMinPrice("");
            setMaxPrice("");
          }}
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
          mapProducts={mapProducts}
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

export default DefaultKitFormScreen;

const styles = StyleSheet.create({
  statCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryHome,
  },

  statNumber: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
  },
});
