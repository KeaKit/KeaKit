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
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerModal } from "react-native-paper-dates";
import { es, registerTranslation } from "react-native-paper-dates";
import { useLocationPicker } from "../../hooks/useLocationPicker";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  TextInput as PaperTextInput,
  Button,
  SegmentedButtons,
} from "react-native-paper";

registerTranslation("es", es);

import { useAuth } from "../../context/AuthContext";
import { createKit, filterItemsForKit } from "../../services/kitService";
import {
  getNearbyArticles,
  getArticlesForMap,
} from "../../services/articleService";
import { getCityCoordinates } from "../../services/cityService";
import { fetchAllCategories } from "../../services/categoryService";
import { processPaymentWithWallet } from "../../services";
import { API_ROUTES } from "../../config/api";
import {
  RootStackParamList,
  KitCreateRequest,
  KitStatus,
  ArticleNearby,
  KitPaymentDTO,
  Category,
  ArticleCondition,
} from "../../types";
import { Colors, commonStyles, componentStyles } from "../../styles";
import { createKitStyles } from "../../styles/createKitStyles";

// Componentes
import { SelectPicker } from "../../components/SelectPicker";
import KitItemComponent from "../../components/KitItemComponent";
import { KitPaymentResumeComponent } from "../../components/KitPaymentResumeComponent";
import { ProductSelectionModal } from "../../components/ProductSelectionModal";
import {
  removeSelectedQuantity,
  upsertSelectedQuantity,
} from "./createKitSelection";
import { styles } from "../../styles/uploadArticleScreenStyles";
import { formatRentalDuration, calculateMonthsBetween } from "../../utils/duration";

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
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | "ACTIVE" | string;
  category?: string;
  condition?: ArticleCondition | null;
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

type CatalogFilterOverrides = {
  showOnlyMyCity?: boolean;
  selectedCategoryId?: string;
  selectedCondition?: string;
  minPrice?: string;
  maxPrice?: string;
};

const CONDITION_OPTIONS = [
  { label: "Cualquier estado", value: "" },
  { label: "Nuevo", value: "NEW" },
  { label: "Poco usado", value: "LIGHTLY_USED" },
  { label: "Usado", value: "USED" },
  { label: "Desgastado", value: "WORN" },
];

const CreateKitScreen: React.FC = () => {
  const navigation = useNavigation<CreateKitNav>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  // Obtener kitToCreate de los parámetros de ruta
  const kitToCreate : Partial<KitCreateRequest> | null = route.params?.kitToCreate;
  const isEditable : boolean = route.params?.isEditable ?? true;

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
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("COURIER");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [courierAddress, setCourierAddress] = useState("");

  const [availableProducts, setAvailableProducts] = useState<CatalogProduct[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [tempSelectedQuantities, setTempSelectedQuantities] = useState<Record<number, number>>({});

  const [searchText, setSearchText] = useState("");
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [showOnlyMyCity, setShowOnlyMyCity] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [expandedSearch, setExpandedSearch] = useState(false);
  const [nearbyProducts, setNearbyProducts] = useState<ArticleNearby[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [targetCityCoords, setTargetCityCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapProducts, setMapProducts] = useState<ArticleNearby[]>([]);

  // Estado para saber si pagamos con wallet o con stripe
  const [paymentType, setPaymentType] = useState<"WALLET" | "NORMAL">("NORMAL");
  
  // Prerrellenado de campos inicial - usar useEffect
  useEffect(() => {
    if (kitToCreate) {
      if (kitToCreate.name) setName(kitToCreate.name);
      if (kitToCreate.itemSelections) {
        const initialQuantities: Record<number, number> = {};
        kitToCreate.itemSelections.forEach((selection: any) => {
          initialQuantities[selection.itemId] = selection.quantity;
        });
        setSelectedQuantities(initialQuantities);
      }
    }
  }, [kitToCreate]);

  // Establecer país y ciudad del usuario cuando estén disponibles
  useEffect(() => {
    if (user?.country) {
      setCountry(user.country);
      void onCountryChange(user.country);
    }

    if (user?.city) {
      setCity(user.city);

      setSelectedCity(user.city);
    }
  }, []);


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
    ])
      .then(([results, coords]) => {
        if (!cancelled) {
          setNearbyProducts(results);
          setTargetCityCoords(coords);
        }
      })
      .catch(() => {
        if (!cancelled) setNearbyProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNearby(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expandedSearch, city, country, user?.token]);

  const monthsBetween = useMemo(() => {
    if (!startDate || !endDate) return null;
    return calculateMonthsBetween(startDate, endDate);
  }, [startDate, endDate]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  useEffect(() => {
    if (!user?.token) return;

    let cancelled = false;
    const loadCategories = async () => {
      try {
        const data = await fetchAllCategories(user.token);
        if (!cancelled) {
          setCatalogCategories(data.filter((category) => category.status === "ACTIVE"));
        }
      } catch (error) {
        console.warn("No se pudieron cargar las categorías del catálogo:", error);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const loadCatalog = useCallback(async (overrides?: CatalogFilterOverrides) => {
    if (!user?.token) {
      setAvailableProducts([]);
      setLoadingCatalog(false);
      setErrors((prev) => ({ ...prev, general: "Necesitas iniciar sesión." }));
      return;
    }

    const nextShowOnlyMyCity = overrides?.showOnlyMyCity ?? showOnlyMyCity;
    const nextSelectedCategoryId = overrides?.selectedCategoryId ?? selectedCategoryId;
    const nextSelectedCondition = overrides?.selectedCondition ?? selectedCondition;
    const nextMinPrice = overrides?.minPrice ?? minPriceFilter;
    const nextMaxPrice = overrides?.maxPrice ?? maxPriceFilter;

    try {
      setLoadingCatalog(true);

      const response = await filterItemsForKit(
        {
          country: country.trim() || undefined,
          city: nextShowOnlyMyCity && city.trim() ? city.trim() : undefined,
          categoryId: nextSelectedCategoryId ? Number(nextSelectedCategoryId) : undefined,
          condition: nextSelectedCondition
            ? (nextSelectedCondition as ArticleCondition)
            : undefined,
          minPrice: nextMinPrice ? parseFloat(nextMinPrice) : undefined,
          maxPrice: nextMaxPrice ? parseFloat(nextMaxPrice) : undefined,
          page: 0,
          size: 100,
        },
        user.token,
      );

      const mapped: CatalogProduct[] = (response.content ?? []).map((p) => ({
        id: Number(p.id),
        itemType: String(p.itemType ?? "ARTICLE"),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"),
        category: typeof p.category === "string" ? p.category : "",
        condition: p.condition ?? null,
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: p.imageUrl ?? null,
        totalUnits: Math.max(1, Number(p.totalUnits ?? 1)),
        availableFrom: p.availableFrom ?? undefined,
        availableUntil: p.availableUntil ?? undefined,
      }));

      setAvailableProducts(mapped);
      setErrors((prev) => ({ ...prev, general: undefined }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el catálogo.";
      if (message.toLowerCase().includes("no items found")) {
        setErrors((prev) => ({ ...prev, general: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
      setAvailableProducts([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, [
    city,
    country,
    maxPriceFilter,
    minPriceFilter,
    selectedCategoryId,
    selectedCondition,
    showOnlyMyCity,
    user?.token,
  ]);

  useEffect(() => {
    loadCatalog();
    const fetchWalletBalance = async () => {
      if (user?.token && user?.id) {
        try {
          const res = await fetch(API_ROUTES.GET_WALLET_BY_USER_ID(user.id), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          });
          const data = await res.json();
          setWalletBalance(data.balance);
        } catch (error) {
          console.error("Error al obtener el saldo de la cartera:", error);
        }
      }
    };

    fetchWalletBalance();
  }, [loadCatalog, user?.token, user?.id]);

  const selectedIds = useMemo(
    () => Object.keys(selectedQuantities).map((id) => Number(id)),
    [selectedQuantities],
  );

  const selectedItemsCount = useMemo(
    () => Object.values(selectedQuantities).reduce((sum, quantity) => sum + quantity, 0),
    [selectedQuantities],
  );

  const selectedProducts = useMemo(
    () => availableProducts.filter((p) => selectedIds.includes(p.id)),
    [availableProducts, selectedIds],
  );

  const totalPrice = useMemo(() => {
    if (monthsBetween === null) return 0;
    return selectedProducts.reduce(
      (sum, p) => sum + p.pricePerMonth * (selectedQuantities[p.id] ?? 1) * monthsBetween,
      0,
    );
  }, [selectedProducts, monthsBetween, selectedQuantities]);

  const courierPrice = deliveryMethod === "COURIER" ? PLATFORM_COURIER_PRICE : 0;

  const kitPayment : KitPaymentDTO = useMemo(() => {
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
      discount: 0, // TODO: Añadir lógica de descuentos a esta pantalla si es necesario

    };
  }, [totalPrice, deliveryMethod]);

  const finalPrice = useMemo(() => {
    const guarantee = totalPrice * GUARANTEE_PERCENTAGE;
    const commission = totalPrice * COMISION;
    return totalPrice + guarantee + commission + courierPrice;
  }, [totalPrice, courierPrice]);

  const categoryOptions = useMemo(
    () => [
      { label: "Todas las categorías", value: "" },
      ...catalogCategories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    ],
    [catalogCategories],
  );

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return availableProducts.filter((p) => {
      const notInactive =
        p.itemType === "SERVICE" ? p.status === "ACTIVE" : p.status !== "INACTIVE";
      const bySearch =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.ownerName ?? "").toLowerCase().includes(q) ||
        (p.condition ?? "").toLowerCase().includes(q);

      return notInactive && bySearch;
    });
  }, [
    availableProducts,
    searchText,
  ]);

  const openAddProductModal = async () => {
    const useCityFilter = city.trim().length > 0;
    setShowOnlyMyCity(useCityFilter);
    await loadCatalog({ showOnlyMyCity: useCityFilter });
    setTempSelectedQuantities(selectedQuantities);

    setSearchText("");
    setShowOnlyAvailable(true);

    // Cargar productos del mapa solo si el usuario está autenticado
    if (user?.token) {
      try {
        const mapData = await getArticlesForMap(user.token, country.trim() || undefined);
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

  const handleApplyCatalogFilters = async () => {
    await loadCatalog();
  };

  const handleClearCatalogFilters = async () => {
    const resetCityFilter = city.trim().length > 0;
    setSelectedCategoryId("");
    setSelectedCondition("");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setShowOnlyMyCity(resetCityFilter);
    await loadCatalog({
      selectedCategoryId: "",
      selectedCondition: "",
      minPrice: "",
      maxPrice: "",
      showOnlyMyCity: resetCityFilter,
    });
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

  const changeTempQuantity = (id: number, nextQuantity: number, maxQuantity: number) => {
    const safeQuantity = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    setTempSelectedQuantities((prev) => upsertSelectedQuantity(prev, id, safeQuantity));
  };

  const confirmSelection = () => {
    setSelectedQuantities(tempSelectedQuantities);
    clearFieldError("items");
    setCatalogModalVisible(false);
  };

  const removeSelectedItem = (id: number) => {
    setSelectedQuantities((prev) => removeSelectedQuantity(prev, id));
    setErrors((prev) => ({ ...prev, items: undefined, general: undefined }));
  };

  const changeSelectedQuantity = (id: number, nextQuantity: number, maxQuantity: number) => {
    const safeQuantity = Math.min(Math.max(nextQuantity, 1), maxQuantity);
    setSelectedQuantities((prev) => upsertSelectedQuantity(prev, id, safeQuantity));
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

  const checkItemsAvailability = (start: Date, end: Date): string[] => {
    const invalidTitles: string[] = [];

    const kitStartNum = start.getFullYear() * 10000 + (start.getMonth() + 1) * 100 + start.getDate();
    const kitEndNum = end.getFullYear() * 10000 + (end.getMonth() + 1) * 100 + end.getDate();

    selectedProducts.forEach((product) => {
      if (!product.availableFrom || !product.availableUntil) return;

      const rawFrom = product.availableFrom.split('T')[0];
      const rawUntil = product.availableUntil.split('T')[0];

      const fromParts = rawFrom.split('-');
      const untilParts = rawUntil.split('-');

      const pStartNum = parseInt(fromParts[0]) * 10000 + parseInt(fromParts[1]) * 100 + parseInt(fromParts[2]);
      const pEndNum = parseInt(untilParts[0]) * 10000 + parseInt(untilParts[1]) * 100 + parseInt(untilParts[2]);

      const isAvailable = (kitStartNum >= pStartNum) && (kitEndNum <= pEndNum);

      if (!isAvailable) {
        invalidTitles.push(product.title);
      }
    });

    return invalidTitles;
  };


  const validate = (isDraft: boolean = false): {
    valid: boolean;
    payloadDates?: { startIso: string; endIso: string };
  } => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "El nombre del kit es obligatorio.";
    if (!startDate) nextErrors.startDate = "Debes seleccionar una fecha inicial.";
    if (!endDate) nextErrors.endDate = "Debes seleccionar una fecha final.";

    if (!isDraft) {
      if (!country.trim()) nextErrors.country = "El país es obligatorio.";
      if (!city.trim()) nextErrors.city = "La ciudad es obligatoria.";
      
      if (deliveryMethod === "MEETING_POINT" && !meetingPoint.trim()) {
        nextErrors.meetingPoint = "Debes indicar un punto de encuentro.";
      }
      if (deliveryMethod === "COURIER" && !courierAddress.trim()) {
        nextErrors.courierAddress = "Debes indicar una dirección de entrega.";
      }

      if (selectedItemsCount === 0) {
        nextErrors.items = "Debes añadir al menos un producto.";
      } else if (startDate && endDate) {
        const invalidItems = checkItemsAvailability(startDate, endDate);
        if (invalidItems.length > 0) {
          nextErrors.items = "No puedes realizar el pedido: hay productos no disponibles.";
        }
      }
    } else {
      if (startDate && endDate) {
        const invalidItems = checkItemsAvailability(startDate, endDate);
        if (invalidItems.length > 0) {
          setErrors(prev => ({...prev, items: `Aviso: Algunos artículos no están disponibles en estas fechas.`}));
        }
      }
    }
    setErrors(prev => ({ ...prev, ...nextErrors }));
    
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
          : courierAddress.trim(),
      tenantId: user.id,
      status: KitStatus.DRAFT, // SIEMPRE LO CREAMOS COMO DRAFT INICIALMENTE
      itemSelections: selectedProducts.map((p) => ({
        itemId: p.id,
        quantity: selectedQuantities[p.id] ?? 1,
        pricePerMonth: p.pricePerMonth,
      })),
    };

    try {
      setSubmitting(true);
      
      const createdKit = await createKit(payload, user.token);
      if (!createdKit) {
        throw new Error("No se pudo crear el kit.");
      }

      if (paymentType === "WALLET") {
        // Multiplicamos por 100 para pasarlo a céntimos
        const amountInCents = Math.round(finalPrice * 100);

        await processPaymentWithWallet(
          createdKit.id,
          user.token,
          amountInCents
        );
        
        navigation.navigate("MyKits");
      } else {
        navigation.navigate("Checkout", { kitId: createdKit.id });
      }

   } catch (err) {
      console.error("ERROR al procesar la creación/pago del kit:", err);

      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const errorMsg = error.response?.data?.message || error.message || "";

      // 3. Aplicamos tu lógica de validación
      if (errorMsg.includes("ya no está disponible") || 
                errorMsg.includes("unidades"))
      {
        setErrors({ items: errorMsg }); // Se mostrará debajo de la lista de artículos

      } else {
        setErrors({ general: "Ha ocurrido un error al procesar el kit o el pago." });
      }
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

            <Text style={[commonStyles.headerTitle, createKitStyles.headerTitle]}>
              {kitToCreate ? "Personaliza tu kit" : "Crea un kit"}
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
            <View
              style={[
                styles.pickerWrapper,
                errors.country ? styles.pickerWrapperError : null,
              ]}
            >
              <Ionicons
                name="earth-outline"
                size={18}
                color={Colors.textSecondary}
                style={styles.pickerIcon}
              />
              <SelectPicker
                options={countries}
                selectedValue={selectedCountry}
                placeholder="Selecciona un país"
                onValueChange={(value: string) => {
                  onCountryChange(value);
                  clearFieldError("country");
                  clearFieldError("city");
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
            <View
              style={[
                styles.pickerWrapper,
                errors.city ? styles.pickerWrapperError : null,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.textSecondary}
                style={styles.pickerIcon}
              />
              {loadingCities ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1 }} />
              ) : (
                <SelectPicker
                  options={cities.map((c) => ({ label: c, value: c }))}
                  selectedValue={selectedCity}
                  placeholder={
                    selectedCountry ? "Selecciona una ciudad" : "Primero elige un país"
                  }
                  disabled={cities.length === 0}
                  onValueChange={(value: string) => {
                    setSelectedCity(value);
                    setCity(value);
                    clearFieldError("city");
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
                ? `${String(startDate.getDate()).padStart(2, "0")}/${String(
                    startDate.getMonth() + 1,
                  ).padStart(2, "0")}/${startDate.getFullYear()} - ${String(
                    endDate.getDate(),
                  ).padStart(2, "0")}/${String(endDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  )}/${endDate.getFullYear()}`
                : "Selecciona rango de fechas del alquiler"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <DatePickerModal
            locale="es"
            mode="range"
            visible={showDateRangePicker}
            onDismiss={() => setShowDateRangePicker(false)}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            allowEditing={false}
            // Busca el DatePickerModal y reemplaza el onConfirm:
            onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
              setShowDateRangePicker(false);
              if (params.startDate && params.endDate) {
                const invalidItems = checkItemsAvailability(params.startDate, params.endDate);
                
                if (invalidItems.length > 0) {
                  // Seteamos el error para que se vea el texto, pero el validate(true) lo ignorará
                  setErrors((prev) => ({
                    ...prev,
                    items: `Atención: Algunos productos no están disponibles en estas fechas: ${invalidItems.join(", ")}`,
                  }));
                } else {
                  clearFieldError("items");
                }

                setStartDate(params.startDate);
                setEndDate(params.endDate);
                clearFieldError("startDate");
                clearFieldError("endDate");
              }
            }}
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
                Duración: {startDate && endDate ? formatRentalDuration(startDate, endDate) : ""}
              </Text>
            </View>
          )}

          <View style={createKitStyles.deliverySection}>
            <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>
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
                  <Text style={commonStyles.errorText}>{errors.meetingPoint}</Text>
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
                  <Text style={commonStyles.errorText}>{errors.courierAddress}</Text>
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
            <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>
              Tus Productos
            </Text>
            {isEditable && (
            <Button
              mode="contained"
              onPress={openAddProductModal}
              icon="plus"
              compact
              style={{ borderRadius: 8 }}
            >
              {selectedItemsCount > 0? "Añadir más productos":"Añadir producto"}
            </Button>
            )}
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
                isEditable={isEditable}
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
            
            {/* Componente del Resumen que reemplaza la vista manual antigua */}
            <KitPaymentResumeComponent kitPrices={kitPayment} />

            {/* Vista con el saldo de la cartera */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: Colors.backgroundCard,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                <Text style={commonStyles.body}>Saldo en cartera</Text>
              </View>
              <Text style={[commonStyles.body, { fontWeight: "bold" }]}>
                {walletBalance.toFixed(2)}€
              </Text>
            </View>

            {/* Botones de acción */}
            <Button
              mode="contained"
              buttonColor={Colors.primary}
              disabled={submitting || walletBalance < finalPrice || finalPrice === 0}
              onPress={() => {
                setPaymentType("WALLET");
                setConfirmVisible(true);
              }}
              icon="wallet"
              style={{ borderRadius: 8, marginBottom: 8 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              {walletBalance >= finalPrice
                ? "Pagar con Cartera"
                : "Saldo insuficiente en cartera"}
            </Button>

            <Button
              mode="outlined"
              onPress={async () => {
                if (!user?.id || !user.token) {
                  setErrors({ general: "Necesitas iniciar sesión." });
                  return;
                }

                const validation = validate(true);
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
                      : courierAddress.trim(),
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
                } catch (error: any) {
                  console.error("Error guardando borrador:", error);
                  
                  const errorMsg = error.response?.data?.message || error.message || "";
                  if (errorMsg.includes("ya no está disponible")) {
                    setErrors({ items: errorMsg });
                  } else {
                    setErrors({ general: "No se pudo guardar el borrador." });
                  }
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
              onPress={() => {
                setConfirmVisible(true);
                setPaymentType("NORMAL");
              }}
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
          categoryOptions={categoryOptions}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          conditionOptions={CONDITION_OPTIONS}
          selectedCondition={selectedCondition}
          onConditionChange={setSelectedCondition}
          minPrice={minPriceFilter}
          maxPrice={maxPriceFilter}
          onMinPriceChange={setMinPriceFilter}
          onMaxPriceChange={setMaxPriceFilter}
          onApplyFilters={handleApplyCatalogFilters}
          onClearFilters={handleClearCatalogFilters}
          filtersLoading={loadingCatalog}
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
                <Button mode="outlined" onPress={() => setConfirmVisible(false)}>
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
