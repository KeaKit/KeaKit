import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { createKit } from "../../services/kitService";
import BASE_URL from "../../config/api";
import { RootStackParamList } from "../../types";
import { Colors, commonStyles, componentStyles } from "../../styles";
import { createKitStyles } from "../../styles/createKitStyles";
import KitItemComponent from "../../components/KitItemComponent";
import {
  removeSelectedQuantity,
  upsertSelectedQuantity,
} from "./createKitSelection";

const GUARANTEE_PERCENTAGE = 0.2; // 20% de garantía sobre el precio total del kit
const PLATFORM_COURIER_PRICE = 9.99;

type CreateKitNav = NativeStackNavigationProp<RootStackParamList, "CreateKit">;

type FormErrors = {
  name?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  meetingPoint?: string;
  items?: string;
  general?: string;
};

type DeliveryMethod = "COURIER" | "MEETING_POINT";

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
};

const toIsoDate = (raw: string): string | null => {
  const value = raw.trim();

  const dmyFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = value.match(dmyFormat);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const valid =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!valid) return null;

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

function calculateMonthsBetween(start: Date, end: Date): number {
  // Función para calcular la duración exacta en meses del alquiler del kit
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  const days = end.getUTCDate() - start.getUTCDate();

  let totalMonths = years * 12 + months;

  const daysInMonth = 30;
  const monthFraction = days / daysInMonth;

  return totalMonths + monthFraction;
}

const toUtcDateOnly = (isoDate: string): Date =>
  new Date(`${isoDate}T00:00:00.000Z`);

const CreateKitScreen: React.FC = () => {
  const navigation = useNavigation<CreateKitNav>();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("COURIER");
  const [meetingPoint, setMeetingPoint] = useState("");

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
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "AVAILABLE" | "RENTED" | "INACTIVE"
  >("ALL");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState<"ALL" | string>("ALL");
  const [appliedStatus, setAppliedStatus] = useState<
    "ALL" | "AVAILABLE" | "RENTED" | "INACTIVE"
  >("ALL");
  const [hasSearched, setHasSearched] = useState(false);

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const monthsBetween = useMemo(() => {
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    if (!startIso || !endIso) return null;

    const start = toUtcDateOnly(startIso);
    const end = toUtcDateOnly(endIso);

    return calculateMonthsBetween(start, end);
  }, [startDate, endDate]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const loadCatalog = useCallback(async () => {
    if (!user?.token) {
      setAvailableProducts([]);
      setLoadingCatalog(false);
      setErrors((prev) => ({ ...prev, general: "Necesitas iniciar sesión." }));
      return;
    }

    try {
      setLoadingCatalog(true);

      const res = await fetch(`${BASE_URL}/api/article/all`, {
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

      const mapped: CatalogProduct[] = (raw ?? [])
        .map((p: any) => ({
          id: Number(p.id),
          title: p.title ?? "Sin título",
          pricePerMonth: Number(p.pricePerMonth ?? 0),
          status: String(p.status ?? "AVAILABLE"),
          category: p.category ?? "",
          city: p.city ?? "",
          ownerName: p.owner?.name ?? "",
          imageUrl: p.imageUrl ?? null,
          totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
        }))
        .filter((p: CatalogProduct) => p.status === "AVAILABLE");

      setAvailableProducts(mapped);
      setErrors((prev) => ({ ...prev, general: undefined }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catálogo.";
      setErrors((prev) => ({ ...prev, general: message }));
      setAvailableProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const selectedIds = useMemo(
    () => Object.keys(selectedQuantities).map((id) => Number(id)),
    [selectedQuantities],
  );

  const selectedItemsCount = useMemo(
    () =>
      Object.values(selectedQuantities).reduce(
        (sum, quantity) => sum + quantity,
        0,
      ),
    [selectedQuantities],
  );

  const selectedProducts = useMemo(
    () => availableProducts.filter((p) => selectedIds.includes(p.id)),
    [availableProducts, selectedIds],
  );

  const totalPrice = useMemo(() => {
    if (monthsBetween === null) return 0;
    return selectedProducts.reduce(
      (sum, p) =>
        sum + p.pricePerMonth * (selectedQuantities[p.id] ?? 1) * monthsBetween,
      0,
    );
  }, [selectedProducts, monthsBetween, selectedQuantities]);

  const courierPrice =
    deliveryMethod === "COURIER" ? PLATFORM_COURIER_PRICE : 0;

  const categories = useMemo(() => {
    const set = new Set(
      availableProducts
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c)),
    );
    return ["ALL", ...Array.from(set)];
  }, [availableProducts]);

  const filteredProducts = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();

    return availableProducts.filter((p) => {
      const byStatus = appliedStatus === "ALL" || p.status === appliedStatus;
      const byCategory =
        appliedCategory === "ALL" || p.category === appliedCategory;
      const bySearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);

      return byStatus && byCategory && bySearch;
    });
  }, [availableProducts, appliedSearch, appliedCategory, appliedStatus]);

  const openAddProductModal = async () => {
    await loadCatalog();
    setTempSelectedQuantities(selectedQuantities);

    setSearchText("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");

    setAppliedSearch("");
    setAppliedCategory("ALL");
    setAppliedStatus("ALL");
    setHasSearched(false);

    setCatalogModalVisible(true);
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchText);
    setAppliedCategory(categoryFilter);
    setAppliedStatus(statusFilter);
    setHasSearched(true);
  };

  const toggleTempSelection = (id: number) => {
    setTempSelectedQuantities((prev) => {
      const isSelected = Object.prototype.hasOwnProperty.call(prev, id);
      if (isSelected) {
        return removeSelectedQuantity(prev, id);
      }
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
    clearFieldError("items");
    setCatalogModalVisible(false);
  };

  const removeSelectedItem = (id: number) => {
    setSelectedQuantities((prev) => removeSelectedQuantity(prev, id));
  };

  const changeSelectedQuantity = (
    id: number,
    nextQuantity: number,
    maxQuantity: number,
  ) => {
    const safeQuantity = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    setSelectedQuantities((prev) =>
      upsertSelectedQuantity(prev, id, safeQuantity),
    );
  };

  const incrementSelectedQuantity = (id: number) => {
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    const current = selectedQuantities[id] ?? 1;
    changeSelectedQuantity(id, current + 1, product.totalUnits);
  };

  const decrementSelectedQuantity = (id: number) => {
    const product = availableProducts.find((p) => p.id === id);
    if (!product) return;
    const current = selectedQuantities[id] ?? 1;
    changeSelectedQuantity(id, current - 1, product.totalUnits);
  };

  const validate = (): {
    valid: boolean;
    payloadDates?: { startIso: string; endIso: string };
  } => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "El nombre del kit es obligatorio.";
    else if (name.trim().length < 3)
      nextErrors.name = "El nombre debe tener al menos 3 caracteres.";

    if (!country.trim()) nextErrors.country = "El país es obligatorio.";
    if (!city.trim()) nextErrors.city = "La ciudad es obligatoria.";
    if (deliveryMethod === "MEETING_POINT" && !meetingPoint.trim()) {
      nextErrors.meetingPoint = "Debes indicar un punto de encuentro.";
    }

    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    if (!startIso)
      nextErrors.startDate =
        "Fecha inválida. Usa DD/MM/AAAA, MM/DD/YYYY o YYYY-MM-DD.";
    if (!endIso)
      nextErrors.endDate =
        "Fecha inválida. Usa DD/MM/AAAA, MM/DD/YYYY o YYYY-MM-DD.";

    if (startIso && endIso) {
      const start = toUtcDateOnly(startIso);
      const end = toUtcDateOnly(endIso);
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );

      if (start < today)
        nextErrors.startDate = "La fecha inicial no puede ser anterior a hoy.";
      if (end < start)
        nextErrors.endDate =
          "La fecha final no puede ser anterior a la inicial.";
    }

    if (selectedItemsCount === 0)
      nextErrors.items = "Debes añadir al menos un producto.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !startIso || !endIso)
      return { valid: false };

    return { valid: true, payloadDates: { startIso, endIso } };
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.token) {
      setErrors({ general: "Necesitas iniciar sesión para crear un kit." });
      return;
    }

    const validation = validate();
    if (!validation.valid || !validation.payloadDates) return;

    try {
      setSubmitting(true);

      await createKit(
        {
          name: name.trim(),
          country: country.trim(),
          city: city.trim(),
          startDate: validation.payloadDates.startIso,
          endDate: validation.payloadDates.endIso,
          deliveryMethod,
          meetingPoint:
            deliveryMethod === "MEETING_POINT"
              ? meetingPoint.trim()
              : undefined,
          tenantId: user.id,
          itemSelections: Object.entries(selectedQuantities).map(
            ([itemId, quantity]) => ({
              itemId: Number(itemId),
              quantity,
            }),
          ),
        },
        user.token,
      );

      Alert.alert("Kit creado", "Tu kit se ha creado correctamente.", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el kit.";
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={createKitStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={createKitStyles.headerRow}>
          <View style={componentStyles.iconButton} />

          <Text style={[commonStyles.headerTitle, createKitStyles.headerTitle]}>
            Crea un Kit
          </Text>

          <View style={componentStyles.iconButton}>
            <Ionicons name="receipt-outline" size={22} color={Colors.primary} />
          </View>
        </View>

        <TextInput
          style={[
            commonStyles.input,
            createKitStyles.inputRounded,
            errors.name && commonStyles.inputError,
          ]}
          placeholder="Nombre Kit"
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearFieldError("name");
          }}
        />
        {errors.name ? (
          <Text style={commonStyles.errorText}>{errors.name}</Text>
        ) : null}

        <View style={createKitStyles.row}>
          <View style={createKitStyles.rowItem}>
            <TextInput
              style={[
                commonStyles.input,
                createKitStyles.inputRounded,
                errors.country && commonStyles.inputError,
              ]}
              placeholder="País"
              value={country}
              onChangeText={(value) => {
                setCountry(value);
                clearFieldError("country");
              }}
            />
            {errors.country ? (
              <Text style={commonStyles.errorText}>{errors.country}</Text>
            ) : null}
          </View>

          <View style={createKitStyles.rowItem}>
            <TextInput
              style={[
                commonStyles.input,
                createKitStyles.inputRounded,
                errors.city && commonStyles.inputError,
              ]}
              placeholder="Ciudad"
              value={city}
              onChangeText={(value) => {
                setCity(value);
                clearFieldError("city");
              }}
            />
            {errors.city ? (
              <Text style={commonStyles.errorText}>{errors.city}</Text>
            ) : null}
          </View>
        </View>

        <TextInput
          style={[
            commonStyles.input,
            createKitStyles.dateInput,
            errors.startDate && commonStyles.inputError,
          ]}
          placeholder="Fecha Inicial del Alquiler (DD/MM/AAAA)"
          value={startDate}
          onChangeText={(value) => {
            setStartDate(value);
            clearFieldError("startDate");
          }}
        />
        {errors.startDate ? (
          <Text style={commonStyles.errorText}>{errors.startDate}</Text>
        ) : null}

        <TextInput
          style={[
            commonStyles.input,
            createKitStyles.dateInput,
            errors.endDate && commonStyles.inputError,
          ]}
          placeholder="Fecha Final del Alquiler (DD/MM/AAAA)"
          value={endDate}
          onChangeText={(value) => {
            setEndDate(value);
            clearFieldError("endDate");
          }}
        />
        {errors.endDate ? (
          <Text style={commonStyles.errorText}>{errors.endDate}</Text>
        ) : null}

        <View style={createKitStyles.deliverySection}>
          <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>
            Método de entrega
          </Text>

          <View style={createKitStyles.deliveryOptionsRow}>
            <TouchableOpacity
              style={[
                createKitStyles.deliveryOption,
                deliveryMethod === "COURIER" &&
                  createKitStyles.deliveryOptionSelected,
              ]}
              onPress={() => {
                setDeliveryMethod("COURIER");
                clearFieldError("meetingPoint");
              }}
            >
              <Text style={createKitStyles.deliveryOptionText}>Mensajería</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                createKitStyles.deliveryOption,
                deliveryMethod === "MEETING_POINT" &&
                  createKitStyles.deliveryOptionSelected,
              ]}
              onPress={() => {
                setDeliveryMethod("MEETING_POINT");
              }}
            >
              <Text style={createKitStyles.deliveryOptionText}>
                Punto de encuentro
              </Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === "MEETING_POINT" ? (
            <>
              <TextInput
                style={[
                  commonStyles.input,
                  createKitStyles.meetingPointInput,
                  errors.meetingPoint && commonStyles.inputError,
                ]}
                placeholder="Ej: Plaza Mayor, Madrid (entrada principal)"
                value={meetingPoint}
                onChangeText={(value) => {
                  setMeetingPoint(value);
                  clearFieldError("meetingPoint");
                }}
              />
              {errors.meetingPoint ? (
                <Text style={commonStyles.errorText}>
                  {errors.meetingPoint}
                </Text>
              ) : null}
            </>
          ) : null}

          {deliveryMethod === "COURIER" ? (
            <Text style={commonStyles.bodySecondary}>
              Tarifa de mensajería: {PLATFORM_COURIER_PRICE.toFixed(2)}€
            </Text>
          ) : null}
        </View>

        {/* Duración del alquiler */}
        {monthsBetween !== null && monthsBetween > 0 && (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={commonStyles.bodySecondary}>
              Duración: {monthsBetween.toFixed(2)} meses
            </Text>
          </View>
        )}

        <View style={createKitStyles.productsHeader}>
          <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>
            Tus Productos
          </Text>
          <TouchableOpacity
            style={createKitStyles.addButton}
            onPress={openAddProductModal}
          >
            <Text style={createKitStyles.addButtonText}>Añadir Producto +</Text>
          </TouchableOpacity>
        </View>

        <View style={createKitStyles.counterBadge}>
          <Text style={createKitStyles.counterBadgeText}>
            Seleccionados: {selectedItemsCount}
          </Text>
        </View>

        {/* Lista de items añadidos al kit */}
        {loadingCatalog ? (
          <View style={createKitStyles.loaderArea}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : selectedProducts.length === 0 ? (
          <Text style={commonStyles.bodySecondary}>
            Aún no has añadido productos al kit. Pulsa "Añadir Producto +".
          </Text>
        ) : (
          selectedProducts.map((item) => (
            <KitItemComponent
              key={item.id}
              item={item}
              quantity={selectedQuantities[item.id] ?? 1}
              maxQuantity={item.totalUnits}
              duration={monthsBetween ?? 0}
              onIncrease={incrementSelectedQuantity}
              onDecrease={decrementSelectedQuantity}
              onRemove={removeSelectedItem}
            />
          ))
        )}

        {errors.items ? (
          <Text style={commonStyles.errorText}>{errors.items}</Text>
        ) : null}
        {errors.general ? (
          <Text style={commonStyles.errorText}>{errors.general}</Text>
        ) : null}
      </ScrollView>

      <View style={createKitStyles.footerRow}>
        {/* Resumen de precios */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={commonStyles.caption}>Subtotal productos</Text>
            <Text style={commonStyles.caption}>{totalPrice.toFixed(2)}€</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={commonStyles.caption}>Garantía (20%)</Text>
            <Text style={commonStyles.caption}>
              {(totalPrice * GUARANTEE_PERCENTAGE).toFixed(2)}€
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={commonStyles.caption}>Tarifa de mensajería</Text>
            <Text style={commonStyles.caption}>{courierPrice.toFixed(2)}€</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              paddingTop: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={[
                commonStyles.caption,
                { color: Colors.primary, fontWeight: "600", fontSize: 16 },
              ]}
            >
              Total a pagar
            </Text>
            <Text
              style={[
                createKitStyles.productTitle,
                { fontSize: 20, color: Colors.primary },
              ]}
            >
              {(
                totalPrice +
                totalPrice * GUARANTEE_PERCENTAGE +
                courierPrice
              ).toFixed(2)}
              €
            </Text>
          </View>

          <TouchableOpacity
            style={[
              commonStyles.primaryButton,
              createKitStyles.submitButton,
              submitting && createKitStyles.submitButtonDisabled,
              { width: "100%" },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text
                style={[
                  commonStyles.primaryButtonText,
                  createKitStyles.submitButtonText,
                ]}
              >
                Realizar Pedido
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={catalogModalVisible} transparent animationType="slide">
        <View style={createKitStyles.modalOverlay}>
          <View style={createKitStyles.modalCard}>
            <Text style={createKitStyles.modalTitle}>Selecciona productos</Text>

            <View style={{ gap: 8, marginBottom: 12 }}>
              <View
                style={[
                  commonStyles.input,
                  { flexDirection: "row", alignItems: "center", gap: 8 },
                ]}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={Colors.textSecondary}
                />
                <TextInput
                  placeholder="Buscar objeto..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{ flex: 1, color: Colors.textPrimary }}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {(["ALL", "AVAILABLE", "RENTED", "INACTIVE"] as const).map(
                  (s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setStatusFilter(s)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor:
                          statusFilter === s ? Colors.primary : Colors.border,
                        backgroundColor:
                          statusFilter === s
                            ? "#EAF3F8"
                            : Colors.backgroundWhite,
                      }}
                    >
                      <Text style={{ color: Colors.primary }}>
                        {s === "ALL" ? "Todos" : s}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategoryFilter(c)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        categoryFilter === c ? Colors.primary : Colors.border,
                      backgroundColor:
                        categoryFilter === c
                          ? "#EAF3F8"
                          : Colors.backgroundWhite,
                    }}
                  >
                    <Text style={{ color: Colors.primary }}>
                      {c === "ALL" ? "Todas" : c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[commonStyles.primaryButton, { marginBottom: 12 }]}
              onPress={handleApplyFilters}
            >
              <Text style={commonStyles.primaryButtonText}>Buscar</Text>
            </TouchableOpacity>

            <ScrollView style={createKitStyles.modalList}>
              {!hasSearched ? (
                <Text style={commonStyles.bodySecondary}>
                  Configura los filtros y pulsa "Buscar".
                </Text>
              ) : filteredProducts.length === 0 ? (
                <Text style={commonStyles.bodySecondary}>
                  No hay productos que cumplan los filtros.
                </Text>
              ) : (
                filteredProducts.map((p) => {
                  const checked = Object.prototype.hasOwnProperty.call(
                    tempSelectedQuantities,
                    p.id,
                  );
                  const selectedQuantity = tempSelectedQuantities[p.id] ?? 1;
                  return (
                    <Pressable
                      key={p.id}
                      style={[
                        createKitStyles.modalRow,
                        checked && createKitStyles.modalRowChecked,
                      ]}
                      onPress={() => toggleTempSelection(p.id)}
                    >
                      <View style={createKitStyles.productInfo}>
                        <Text style={createKitStyles.productTitle}>
                          {p.title}
                        </Text>

                        <Text style={commonStyles.caption}>
                          {p.ownerName ? `${p.ownerName} · ` : ""}
                          {p.city ? `${p.city} · ` : ""}
                          {p.category ? `${p.category} · ` : ""}
                          {p.pricePerMonth.toFixed(2)}€ / mes
                        </Text>
                        <Text style={commonStyles.caption}>
                          Unidades disponibles: {p.totalUnits}
                        </Text>
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
                                changeTempQuantity(
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
                                changeTempQuantity(
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
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={checked ? Colors.success : Colors.primary}
                      />
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <View style={createKitStyles.modalActions}>
              <TouchableOpacity
                style={[commonStyles.outlineButton, createKitStyles.modalBtn]}
                onPress={() => setCatalogModalVisible(false)}
              >
                <Text style={commonStyles.outlineButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.primaryButton, createKitStyles.modalBtn]}
                onPress={confirmSelection}
              >
                <Text style={commonStyles.primaryButtonText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateKitScreen;
