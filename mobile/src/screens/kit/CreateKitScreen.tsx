import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectPicker } from '../../components/SelectPicker';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerModal } from "react-native-paper-dates";
import { es, registerTranslation } from "react-native-paper-dates";
import { useLocationPicker } from '../../hooks/useLocationPicker';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  TextInput as PaperTextInput,
  Button,
  SegmentedButtons,
} from "react-native-paper";

registerTranslation("es", es);

import { useAuth } from "../../context/AuthContext";
import { createKit } from "../../services/kitService";
import { getNearbyArticles, getArticlesForMap } from "../../services/articleService";
import { getCityCoordinates } from "../../services/cityService";
import { API_ROUTES } from "../../config/api";
import { RootStackParamList, KitPaymentDTO, KitCreateRequest, KitStatus, ArticleNearby } from "../../types";
import { Colors, commonStyles, componentStyles } from "../../styles";
import { createKitStyles } from "../../styles/createKitStyles";
import KitItemComponent from "../../components/KitItemComponent";
import { KitPaymentResumeComponent } from "../../components/KitPaymentResumeComponent";
import { ProductSelectionModal } from "../../components/ProductSelectionModal";
import {
  removeSelectedQuantity,
  upsertSelectedQuantity,
} from "./createKitSelection";
import { styles } from "../../styles/uploadArticleScreenStyles";

const COMISION = 0; // todos son usuarios pilotos y no se cobra comision
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
  courierAddress?: string;
  items?: string;
  general?: string;
};

type DeliveryMethod = "COURIER" | "MEETING_POINT";

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
  distanceKm?: number;
  cityLat?: number;
  cityLng?: number;
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

    const {
      selectedCountry,
      selectedCity,
      setSelectedCity,
      cities,
      countries,
      loadingCities,
      onCountryChange,
    } = useLocationPicker();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("COURIER");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [courierAddress, setCourierAddress] = useState("");

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
  const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [payment, setPayment] = useState<KitPaymentDTO | null>(null);
  const [expandedSearch, setExpandedSearch] = useState(false);
  const [nearbyProducts, setNearbyProducts] = useState<ArticleNearby[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [targetCityCoords, setTargetCityCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapProducts, setMapProducts] = useState<ArticleNearby[]>([]);

  useEffect(() => {
    if (!expandedSearch || !city.trim() || !country.trim() || !user?.token) {
      setNearbyProducts([]);
      setTargetCityCoords(null);
      return;
    }
    let cancelled = false;
    setLoadingNearby(true);
    Promise.all([
      getNearbyArticles(city.trim(), country.trim(), user.token),
      getCityCoordinates(city.trim(), country.trim()),
    ]).then(([results, coords]) => {
      if (!cancelled) {
        setNearbyProducts(results);
        setTargetCityCoords(coords);
      }
    }).catch(() => {
      if (!cancelled) setNearbyProducts([]);
    }).finally(() => {
      if (!cancelled) setLoadingNearby(false);
    });
    return () => { cancelled = true; };
  }, [expandedSearch, city, country, user?.token]);

  const monthsBetween = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ),
    );
    const end = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
    );

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
        itemType: String(p.itemType ?? "ARTICLE"),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"), // para SERVICE llega null, lo normalizamos
        category:
          typeof p.category === "string"
            ? p.category
            : (p.category?.name ?? ""),
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: p.imageUrl ?? null,
        totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
        availableFrom: p.availableFrom ?? null,
        availableUntil: p.availableUntil ?? null,
      }));

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

  const kitPayment = useMemo(() => {
    const subtotal = Math.round(totalPrice * 100); 
    const guarantee = Math.round(subtotal * GUARANTEE_PERCENTAGE);
    const platformfee = Math.round(subtotal * COMISION);
    const courier = deliveryMethod === "COURIER" ? Math.round(PLATFORM_COURIER_PRICE * 100) : 0;
    const total = subtotal + guarantee + platformfee + courier;

    return {
      subtotalPrice: subtotal,
      guarantee: guarantee,
      platformfee: platformfee,
      courierPrice: courier,
      totalPrice: total,
    };
  }, [totalPrice, deliveryMethod]);

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

    const local = availableProducts.filter((p) => {
      const notInactive = p.itemType === "SERVICE" || p.status !== "INACTIVE";
      const byCategory =
        categoryFilter === "ALL" || p.category === categoryFilter;
      const byCity =
        !showOnlyMyCity ||
        !city.trim() ||
        (p.city ?? "").toLowerCase() === city.trim().toLowerCase();
      const bySearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);

      return notInactive && byCategory && byCity && bySearch;
    });

    if (!expandedSearch || nearbyProducts.length === 0) return local;

    const localIds = new Set(local.map((p) => p.id));
    const nearby: CatalogProduct[] = nearbyProducts
      .filter((p) => {
        if (localIds.has(p.id)) return false;
        const byCategory = categoryFilter === "ALL" || p.category === categoryFilter;
        const bySearch =
          q.length === 0 ||
          p.title.toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q);
        return byCategory && bySearch;
      })
      .map((p) => ({
        id: p.id,
        itemType: p.itemType,
        title: p.title,
        pricePerMonth: p.pricePerMonth,
        status: p.status ?? "AVAILABLE",
        category: p.category ?? undefined,
        city: p.city,
        ownerId: p.ownerId ?? 0,
        ownerName: p.ownerName ?? undefined,
        imageUrl: p.imageUrl,
        totalUnits: p.totalUnits ?? 1,
        availableFrom: p.availableFrom ?? undefined,
        availableUntil: p.availableUntil ?? undefined,
        distanceKm: p.distanceKm,
        cityLat: p.cityLat,
        cityLng: p.cityLng,
      }));

    return [...local, ...nearby];
  }, [availableProducts, nearbyProducts, searchText, categoryFilter, showOnlyMyCity, city, expandedSearch]);

  const openAddProductModal = async () => {
    await loadCatalog();
    setTempSelectedQuantities(selectedQuantities);

    setSearchText("");
    setCategoryFilter("ALL");
    setShowOnlyMyCity(city.trim().length > 0);
    setShowOnlyAvailable(true);

    if (user?.token) {
      getArticlesForMap(user.token, country.trim() || undefined)
        .then(setMapProducts)
        .catch(() => setMapProducts([]));
    }

    setCatalogModalVisible(true);
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
    if (deliveryMethod === "COURIER" && !courierAddress.trim()) {
      nextErrors.courierAddress = "Debes indicar una dirección de entrega.";
    }

    if (!startDate)
      nextErrors.startDate = "Debes seleccionar una fecha inicial.";
    if (!endDate) nextErrors.endDate = "Debes seleccionar una fecha final.";

    if (selectedItemsCount === 0)
      nextErrors.items = "Debes añadir al menos un producto.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !startDate || !endDate)
      return { valid: false };

    const startIso = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const endIso = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    return { valid: true, payloadDates: { startIso, endIso } };
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.token) {
      setErrors({ general: "Necesitas iniciar sesión para crear un kit." });
      return;
    }

    const validation = validate();
    if (!validation.valid || !validation.payloadDates) return;

    const payload: KitCreateRequest = {
      name: name.trim(),
      country: country.trim(),
      city: city.trim(),
      startDate: validation.payloadDates.startIso,
      endDate: validation.payloadDates.endIso,
      deliveryMethod,
      meetingPoint:
        deliveryMethod === "MEETING_POINT"
          ? meetingPoint.trim()
          : deliveryMethod === "COURIER"
            ? courierAddress.trim()
            : undefined,
      tenantId: user.id,
      itemSelections: selectedProducts.map((p) => ({
        itemId: p.id,
        quantity: selectedQuantities[p.id] ?? 1,
        pricePerMonth: p.pricePerMonth,
      })),
    };

    const handleCreateKit = async () => {
      try {
        setSubmitting(true);
        const response = await createKit(payload, user.token);
        return response;
      } catch (error) {
        console.error("🔥 ERROR al crear kit:", error);
        return null;
      } finally {
        setSubmitting(false);
      }
    };
    const createdKit = await handleCreateKit();
    if (!createdKit) {
      console.error("🔥 ERROR: No se pudo crear el kit.");
      return;
    }
    console.log("Created kit:", createdKit);

    navigation.navigate("Checkout", { kitId: createdKit.id });
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
      secondaryContainer: "#E3F2FD",
      onSecondaryContainer: Colors.primary,
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        <ScrollView
          contentContainerStyle={createKitStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={createKitStyles.headerRow}>
            {/* Botón de volver */}
            <TouchableOpacity
              style={componentStyles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>

            <Text
              style={[commonStyles.headerTitle, createKitStyles.headerTitle]}
            >
              Crea un Kit
            </Text>

            {/* Mantener espacio a la derecha para centrar el título */}
            <View style={componentStyles.iconButton} />
          </View>

          <PaperTextInput
            mode="outlined"
            label="Nombre del Kit"
            value={name}
            onChangeText={(value) => {
              setName(value);
              clearFieldError("name");
            }}
            error={!!errors.name}
            style={{ backgroundColor: Colors.backgroundWhite }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />
          {errors.name ? (
            <Text style={commonStyles.errorText}>{errors.name}</Text>
          ) : null}

            {/* País */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>País</Text>
              <View style={[styles.pickerWrapper, errors.country ? styles.pickerWrapperError : null]}>
                <Ionicons name="earth-outline" size={18} color={Colors.textSecondary} style={styles.pickerIcon} />
                <SelectPicker
                  options={countries}
                  selectedValue={selectedCountry}
                  placeholder="Selecciona un país"
                  onValueChange={(value: string) => {
                    onCountryChange(value);
                    clearFieldError('country');
                    clearFieldError('city');
                    setCountry(value);
                  }}
                />
              </View>
              {!!errors.country && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.country}</Text>
                </View>
              )}
            </View>

            {/* Ciudad */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Ciudad</Text>
              <View style={[styles.pickerWrapper, errors.city ? styles.pickerWrapperError : null]}>
                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} style={styles.pickerIcon} />
                {loadingCities ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1 }} />
                ) : (
                  <SelectPicker
                    options={cities.map(c => ({ label: c, value: c }))}
                    selectedValue={selectedCity}
                    placeholder={selectedCountry ? 'Selecciona una ciudad' : 'Primero elige un país'}
                    disabled={cities.length === 0}
                    onValueChange={(value: string) => {
                      setSelectedCity(value);
                      setCity(value);
                      clearFieldError('city');
                    }}
                  />
                )}
              </View>
              {!!errors.city && (
                <View style={commonStyles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color={Colors.error} />
                  <Text style={commonStyles.errorText}>{errors.city}</Text>
                </View>
              )}
            </View>


          <TouchableOpacity
            style={[
              commonStyles.input,
              createKitStyles.dateInput,
              (errors.startDate || errors.endDate) && commonStyles.inputError,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
            onPress={() => setShowDateRangePicker(true)}
          >
            <Text
              style={[
                {
                  color:
                    startDate && endDate
                      ? Colors.textPrimary
                      : Colors.textSecondary,
                },
              ]}
            >
              {startDate && endDate
                ? `${String(startDate.getDate()).padStart(2, "0")}/${String(startDate.getMonth() + 1).padStart(2, "0")}/${startDate.getFullYear()} - ${String(endDate.getDate()).padStart(2, "0")}/${String(endDate.getMonth() + 1).padStart(2, "0")}/${endDate.getFullYear()}`
                : "Selecciona rango de fechas del alquiler"}
            </Text>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <DatePickerModal
            locale="es"
            mode="range"
            visible={showDateRangePicker}
            onDismiss={() => setShowDateRangePicker(false)}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
              setShowDateRangePicker(false);
              if (params.startDate && params.endDate) {
                setStartDate(params.startDate);
                setEndDate(params.endDate);
                clearFieldError("startDate");
                clearFieldError("endDate");
              }
            }}
            validRange={{ startDate: new Date() }}
          />
          {errors.startDate ? (
            <Text style={commonStyles.errorText}>{errors.startDate}</Text>
          ) : null}
          {errors.endDate ? (
            <Text style={commonStyles.errorText}>{errors.endDate}</Text>
          ) : null}

          {/* Duración del alquiler */}
          {monthsBetween !== null && monthsBetween > 0 && (
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={commonStyles.bodySecondary}>
                Duración: {monthsBetween.toFixed(2)} meses
              </Text>
            </View>
          )}

          <View style={createKitStyles.deliverySection}>
            <Text
              style={[commonStyles.subtitle, createKitStyles.productsTitle]}
            >
              Método de entrega
            </Text>

            <SegmentedButtons
              value={deliveryMethod}
              onValueChange={(value) => {
                setDeliveryMethod(value as DeliveryMethod);
                clearFieldError("meetingPoint");
                clearFieldError("courierAddress");
              }}
              buttons={[
                {
                  value: "COURIER",
                  label: "Mensajería",
                  icon: "truck-delivery",
                },
                {
                  value: "MEETING_POINT",
                  label: "Punto de encuentro",
                  icon: "map-marker",
                },
              ]}
              style={{ marginVertical: 12 }}
            />

            {deliveryMethod === "MEETING_POINT" ? (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="Punto de encuentro"
                  placeholder="Ej: Plaza Mayor, Madrid (entrada principal)"
                  value={meetingPoint}
                  onChangeText={(value) => {
                    setMeetingPoint(value);
                    clearFieldError("meetingPoint");
                  }}
                  error={!!errors.meetingPoint}
                  style={{
                    backgroundColor: Colors.backgroundWhite,
                    marginTop: 12,
                  }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                  multiline
                />
                {errors.meetingPoint ? (
                  <Text style={commonStyles.errorText}>
                    {errors.meetingPoint}
                  </Text>
                ) : null}
              </>
            ) : null}

            {deliveryMethod === "COURIER" ? (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="Dirección de entrega"
                  value={courierAddress}
                  onChangeText={(value) => {
                    setCourierAddress(value);
                    clearFieldError("courierAddress");
                  }}
                  error={!!errors.courierAddress}
                  style={{
                    backgroundColor: Colors.backgroundWhite,
                    marginTop: 12,
                  }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                  multiline
                />
                {errors.courierAddress ? (
                  <Text style={commonStyles.errorText}>
                    {errors.courierAddress}
                  </Text>
                ) : null}
              </>
            ) : null}

            {deliveryMethod === "COURIER" ? (
              <Text style={commonStyles.bodySecondary}>
                Se aplicará una tarifa fija de mensajería de{" "}
                {PLATFORM_COURIER_PRICE.toFixed(2)}€ al total del kit.
              </Text>
            ) : null}
          </View>

          <View style={createKitStyles.productsHeader}>
            <Text
              style={[commonStyles.subtitle, createKitStyles.productsTitle]}
            >
              Tus Productos
            </Text>
            <Button
              mode="contained"
              onPress={openAddProductModal}
              icon="plus"
              compact
              style={{ borderRadius: 8 }}
            >
              Añadir Producto
            </Button>
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
            <KitPaymentResumeComponent kitPrices={kitPayment} />

            <Button
              mode="outlined"
              onPress={async () => {
                if (!user?.id || !user.token) {
                  setErrors({ general: "Necesitas iniciar sesión." });
                  return;
                }

                const validation = validate();
                if (!validation.valid || !validation.payloadDates) return;

                const payload: KitCreateRequest = {
                  name: name.trim(),
                  country: country.trim(),
                  city: city.trim(),
                  startDate: validation.payloadDates.startIso,
                  endDate: validation.payloadDates.endIso,
                  deliveryMethod,
                  meetingPoint:
                    deliveryMethod === "MEETING_POINT"
                      ? meetingPoint.trim()
                      : deliveryMethod === "COURIER"
                        ? courierAddress.trim()
                        : undefined,
                  tenantId: user.id,
                  itemSelections: selectedProducts.map((p) => ({
                    itemId: p.id,
                    quantity: selectedQuantities[p.id] ?? 1,
                    pricePerMonth: p.pricePerMonth,
                  })),
                  status: KitStatus.DRAFT,
                };

                try {
                  setSubmitting(true);
                  const created = await createKit(payload, user.token);
                  if (created) {
                    navigation.navigate("MyKits");
                  }
                } catch (e) {
                  console.error("Error guardando borrador:", e);
                } finally {
                  setSubmitting(false);
                }
              }}
              style={{ borderRadius: 8, marginBottom: 8 }}
            >
              Guardar para pagar más tarde
            </Button>


            <Button
              mode="contained"
              onPress={() => setConfirmVisible(true)}
              disabled={submitting}
              loading={submitting}
              icon="cart-outline"
              style={{ borderRadius: 8 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              Realizar Pedido
            </Button>
          </View>
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
          userCity={city.trim()}
          showOnlyMyCity={showOnlyMyCity}
          onToggleMyCity={setShowOnlyMyCity}
          showOnlyAvailable={showOnlyAvailable}
          onToggleAvailable={setShowOnlyAvailable}
          startDate={startDate}
          endDate={endDate}
          expandedSearch={expandedSearch}
          onToggleExpandedSearch={() => setExpandedSearch((v) => !v)}
          loadingNearby={loadingNearby}
          targetCityCoords={targetCityCoords}
          mapProducts={mapProducts}
        />

        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: "#111",
                }}
              >
                Depósito de garantía
              </Text>

              <Text style={{ fontSize: 15, color: "#444", marginBottom: 20 }}>
                Recuerda que el 20% se retendrá como garantía y se te devolverá
                cuando el kit sea devuelto en buen estado.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <Button
                  mode="outlined"
                  onPress={() => setConfirmVisible(false)}
                >
                  Cancelar
                </Button>

                <Button
                  mode="contained"
                  onPress={() => {
                    setConfirmVisible(false);
                    handleSubmit();
                  }}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default CreateKitScreen;
