import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Colors } from "../../styles";
import { defaultKitStyles } from "../../styles/defaultKitStyles";
import { PresetProductSelectionModal } from "../../components/PresetProductSelectionModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { API_ROUTES } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import {
  addItemToKit,
  getKit,
  removeItemFromKit,
} from "../../services/kitService";
import { KitResponse, RootStackParamList } from "../../types";

type EditDefaultKitNav = NativeStackNavigationProp<
  RootStackParamList,
  "EditDefaultKit"
>;

type EditDefaultKitRoute = RouteProp<RootStackParamList, "EditDefaultKit">;

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
};

const EditDefaultKitScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<EditDefaultKitNav>();
  const route = useRoute<EditDefaultKitRoute>();
  const { kitId } = route.params;

  const [kit, setKit] = useState<KitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
  const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [pendingAddIds, setPendingAddIds] = useState<number[]>([]);
  const [pendingRemoveIds, setPendingRemoveIds] = useState<number[]>([]);

  const loadKit = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const data = await getKit(kitId, user.token);
      setKit(data);
    } catch (error) {
      console.error("Error loading kit:", error);
    } finally {
      setLoading(false);
    }
  }, [kitId, user?.token]);

  const loadCatalog = useCallback(async () => {
    if (!user?.token) return;
    try {
      setCatalogLoading(true);
      const res = await fetch(API_ROUTES.ITEMS_FOR_RENT(user.id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      if (!contentType.includes("application/json")) {
        throw new Error(`Respuesta no JSON: ${text}`);
      }
      const raw = JSON.parse(text);
      const mapped: CatalogProduct[] = (raw ?? []).map((p: any) => ({
        id: Number(p.id),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"),
        category:
          typeof p.category === "string" ? p.category : p.category?.name ?? "",
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: p.imageUrl ?? null,
        totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
      }));
      setCatalog(mapped);
    } catch (error) {
      console.error("Error loading catalog:", error);
    } finally {
      setCatalogLoading(false);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    loadKit();
    loadCatalog();
  }, [loadKit, loadCatalog]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [catalog]);

  const effectiveIds = useMemo(() => {
    const baseIds = kit?.itemIds ?? [];
    const removed = new Set(pendingRemoveIds);
    const ids = baseIds.filter((id) => !removed.has(id));
    pendingAddIds.forEach((id) => {
      if (!ids.includes(id)) ids.push(id);
    });
    return ids;
  }, [kit?.itemIds, pendingAddIds, pendingRemoveIds]);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const currentIds = new Set(effectiveIds);

    return catalog.filter((product) => {
      if (currentIds.has(product.id)) return false;
      if (showOnlyMyCity && user?.city && product.city !== user.city) {
        return false;
      }
      if (categoryFilter !== "ALL" && product.category !== categoryFilter) {
        return false;
      }
      if (query) {
        const text = `${product.title} ${product.category ?? ""}`.toLowerCase();
        return text.includes(query);
      }
      return true;
    });
  }, [catalog, categoryFilter, effectiveIds, searchText, showOnlyMyCity, user?.city]);

  const hasPendingChanges = pendingAddIds.length > 0 || pendingRemoveIds.length > 0;

  const visibleItems = useMemo(() => {
    if (!kit) return [] as Array<{
      itemId: number;
      name: string;
      category: string;
      pricePerMonth: number;
      source: "kit" | "catalog";
    }>;

    const removed = new Set(pendingRemoveIds);
    const itemsFromKit = (kit.items ?? [])
      .filter((item) => !removed.has(item.itemId))
      .map((item) => ({
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        pricePerMonth: item.pricePerMonth,
        source: "kit" as const,
      }));

    const itemsFromCatalog = pendingAddIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => ({
        itemId: product!.id,
        name: product!.title,
        category: product!.category ?? "",
        pricePerMonth: product!.pricePerMonth,
        source: "catalog" as const,
      }));

    const merged = [...itemsFromKit, ...itemsFromCatalog];
    const seen = new Set<number>();
    return merged.filter((item) => {
      if (seen.has(item.itemId)) return false;
      seen.add(item.itemId);
      return true;
    });
  }, [catalog, kit, pendingAddIds, pendingRemoveIds]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const handleAddItems = () => {
    if (selectedIds.length === 0) {
      setModalVisible(false);
      return;
    }

    setPendingRemoveIds((prev) => prev.filter((id) => !selectedIds.includes(id)));
    setPendingAddIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.add(id));
      return Array.from(next);
    });

    setSelectedIds([]);
    setModalVisible(false);
  };

  const handleRemoveItem = (itemId: number) => {
    if (pendingAddIds.includes(itemId)) {
      setPendingAddIds((prev) => prev.filter((id) => id !== itemId));
      return;
    }

    setPendingRemoveIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const isEmptyKit = visibleItems.length === 0;

  const handleConfirmChanges = async () => {
  if (!user?.token || !hasPendingChanges || isEmptyKit || saving) return;

    try {
      setSaving(true);
      const kitItemIds = new Set(kit?.itemIds ?? []);
      const uniqueRemoveIds = Array.from(new Set(pendingRemoveIds));
      const uniqueAddIds = Array.from(new Set(pendingAddIds)).filter(
        (itemId) => !kitItemIds.has(itemId),
      );

      if (uniqueRemoveIds.length > 0) {
        await Promise.all(
          uniqueRemoveIds.map((itemId) =>
            removeItemFromKit(kitId, itemId, user.id, user.token),
          ),
        );
      }
      if (uniqueAddIds.length > 0) {
        await Promise.all(
          uniqueAddIds.map((itemId) =>
            addItemToKit(kitId, itemId, user.id, user.token),
          ),
        );
      }
      setPendingAddIds([]);
      setPendingRemoveIds([]);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!hasPendingChanges) {
      navigation.goBack();
      return;
    }

    setExitConfirmVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={defaultKitStyles.screen}>
        <View style={defaultKitStyles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primaryHome} />
          <Text style={defaultKitStyles.helperText}>Cargando kit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!kit) {
    return (
      <SafeAreaView style={defaultKitStyles.screen}>
        <View style={defaultKitStyles.emptyState}>
          <Ionicons name="alert-circle-outline" size={54} color={Colors.primaryHome} />
          <Text style={defaultKitStyles.emptyTitle}>Kit no disponible</Text>
          <Text style={defaultKitStyles.emptySubtitle}>
            Inténtalo de nuevo más tarde.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={defaultKitStyles.screen}>
      <View style={defaultKitStyles.header}>
        <TouchableOpacity
          style={defaultKitStyles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryHome} />
        </TouchableOpacity>
        <Text style={defaultKitStyles.headerTitle}>Editar kit</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={defaultKitStyles.listContent}>
        <Text style={defaultKitStyles.cardTitle}>{kit.name}</Text>
        <Text style={defaultKitStyles.cardSubtitle}>
          {kit.city}, {kit.country}
        </Text>
        <Text style={[defaultKitStyles.helperText, { marginTop: 6 }]}
        >
          Añade o elimina productos para personalizar este kit predeterminado.
        </Text>

        <Text style={defaultKitStyles.sectionTitle}>Productos incluidos</Text>

        {visibleItems.length ? (
          visibleItems.map((item) => (
            <View key={item.itemId} style={defaultKitStyles.itemRow}>
              <View style={defaultKitStyles.itemInfo}>
                <Text style={defaultKitStyles.itemName}>{item.name}</Text>
                <Text style={defaultKitStyles.itemMeta}>
                  {item.category} · {item.pricePerMonth}€/mes
                </Text>
              </View>
              <TouchableOpacity
                style={defaultKitStyles.removeButton}
                onPress={() => handleRemoveItem(item.itemId)}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={22}
                  color={Colors.error}
                />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={defaultKitStyles.helperText}>
            Este kit aún no tiene productos.
          </Text>
        )}

        <TouchableOpacity
          style={defaultKitStyles.addButton}
          onPress={() => setModalVisible(true)}
          disabled={catalogLoading || saving}
        >
          <Text style={defaultKitStyles.addButtonText}>
            {catalogLoading ? "Cargando catálogo..." : "Añadir productos"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            defaultKitStyles.confirmButton,
            (!hasPendingChanges || isEmptyKit) &&
              defaultKitStyles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmChanges}
          disabled={!hasPendingChanges || isEmptyKit || saving}
        >
          <Text style={defaultKitStyles.confirmButtonText}>
            Confirmar cambios
          </Text>
        </TouchableOpacity>

        {isEmptyKit && (
          <Text style={defaultKitStyles.warningText}>
            El kit debe tener al menos un producto para guardarse.
          </Text>
        )}
      </ScrollView>

      <PresetProductSelectionModal
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedIds([]);
        }}
        searchText={searchText}
        onSearchChange={setSearchText}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={availableCategories}
        filteredProducts={filteredProducts}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onConfirm={handleAddItems}
        userCity={user?.city}
        showOnlyMyCity={showOnlyMyCity}
        onToggleMyCity={setShowOnlyMyCity}
      />

      <ConfirmModal
        visible={exitConfirmVisible}
        title="Descartar cambios"
        message="¿Quieres salir de la página? Se descartarán tus cambios."
        confirmText="Salir"
        cancelText="Cancelar"
        onCancel={() => setExitConfirmVisible(false)}
        onConfirm={() => {
          setExitConfirmVisible(false);
          navigation.goBack();
        }}
        confirmStyle="destructive"
      />

      {saving && (
        <View
          style={[
            defaultKitStyles.emptyState,
            { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
          ]}
        >
          <ActivityIndicator size="large" color={Colors.primaryHome} />
          <Text style={defaultKitStyles.helperText}>Actualizando kit...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default EditDefaultKitScreen;
