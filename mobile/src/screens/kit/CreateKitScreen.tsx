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
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
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
import { Helmet } from 'react-helmet-async'; 

const COMISION = 0;
const GUARANTEE_PERCENTAGE = 0.2;
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

const normalizeTotalUnits = (value: unknown): number => {
  const units = Number(value ?? 1);
  return Number.isFinite(units) ? Math.max(0, units) : 1;
};

// Constantes de validación (movidas fuera del componente para garantizar su existencia)
const MAX_KIT_NAME_LENGTH = 255;
const MAX_MEETING_POINT_LENGTH = 500;
const MAX_COURIER_ADDRESS_LENGTH = 500;

const CreateKitScreen: React.FC = () => {
  const navigation = useNavigation<CreateKitNav>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const resetToMyKits = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MyKits" }],
      }),
    );
  };

  const kitToCreate: Partial<KitCreateRequest> | null = route.params?.kitToCreate;
  const isEditable: boolean = route.params?.isEditable ?? true;

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

    void loadCategories();

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
          country: undefined,
          city: nextShowOnlyMyCity && city.trim() ? city.trim() : undefined,
          categoryId: nextSelectedCategoryId ? Number(nextSelectedCategoryId) : undefined,
          condition: nextSelectedCondition ? (nextSelectedCondition as ArticleCondition) : undefined,
          minPrice: nextMinPrice ? parseFloat(nextMinPrice) : undefined,
          maxPrice: nextMaxPrice ? parseFloat(nextMaxPrice) : undefined,
          page: 0,
          size: 100,
          startDate: startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}` : undefined,
          endDate: endDate ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}` : undefined,
        },
        user.token,
      );

      const mapped: CatalogProduct[] = response.content.map((p) => ({
        id: Number(p.id),
        itemType: String(p.itemType ?? "ARTICLE"),
        title: p.title ?? "Sin título",
        pricePerMonth: Number(p.pricePerMonth ?? 0),
        status: String(p.status ?? "AVAILABLE"),
        category: typeof p.category === "string" ? p.category : "",
        condition: (p as any).condition ?? null,
        city: p.city ?? "",
        ownerId: Number(p.ownerId),
        ownerName: p.ownerName ?? "",
        imageUrl: (p as any).imageUrl ?? null,
        totalUnits: normalizeTotalUnits(p.totalUnits),
        availableFrom: (p as any).availableFrom ?? undefined,
        availableUntil: (p as any).availableUntil ?? undefined,
      }));

      const filteredByOwner = mapped.filter(p => p.ownerId !== user?.id);

      setAvailableProducts(filteredByOwner);
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
    maxPriceFilter,
    minPriceFilter,
    selectedCategoryId,
    selectedCondition,
    showOnlyMyCity,
    user?.token,
    user?.id,
    startDate, 
    endDate,
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

  const selectedProducts = useMemo(
    () => {
      return availableProducts.filter((p) => selectedIds.includes(p.id));
    },
    [availableProducts, selectedIds],
  );

  const selectedItemsCount = useMemo(
    () => Object.values(selectedQuantities).reduce((sum, quantity) => sum + quantity, 0),
    [selectedQuantities],
  );

  const totalPrice = useMemo(() => {
    if (monthsBetween === null) return 0;
    return selectedProducts.reduce(
      (sum, p) => sum + p.pricePerMonth * (selectedQuantities[p.id] ?? 1) * monthsBetween,
      0,
    );
  }, [selectedProducts, monthsBetween, selectedQuantities]);

  const courierPrice = deliveryMethod === "COURIER" ? PLATFORM_COURIER_PRICE : 0;

  const kitPayment: KitPaymentDTO = useMemo(() => {
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
      discount: 0,
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
        const notInactive = p.itemType === "SERVICE" ? p.status === "ACTIVE" : p.status !== "INACTIVE";
        
        const isAvailable = p.status === "AVAILABLE" || p.status === "ACTIVE";
        const passesAvailabilityFilter = showOnlyAvailable ? isAvailable : true;

        const bySearch =
          q.length === 0 ||
          p.title.toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.ownerName ?? "").toLowerCase().includes(q) ||
          (p.condition ?? "").toLowerCase().includes(q);

        return notInactive && bySearch && passesAvailabilityFilter;
      });
    }, [availableProducts, searchText, showOnlyAvailable]);

  const openAddProductModal = async () => {
    const useCityFilter = city.trim().length > 0;
    setShowOnlyMyCity(useCityFilter);
    await loadCatalog({ showOnlyMyCity: useCityFilter });
    setTempSelectedQuantities(selectedQuantities);
    setSearchText("");
    setShowOnlyAvailable(true);

    if (user?.token) {
      try {
        const mapData = await getArticlesForMap(
          user.token,
          country.trim() || undefined,
          true,
        );
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

    const kitStart = new Date(start);
    kitStart.setHours(0, 0, 0, 0);
    
    const kitEnd = new Date(end);
    kitEnd.setHours(0, 0, 0, 0);

    selectedProducts.forEach((product) => {
      if (!product.availableFrom || !product.availableUntil) {
        const isAvailable = product.status === "AVAILABLE" || product.status === "ACTIVE";
        if (!isAvailable) invalidTitles.push(product.title);
        return;
      }

      const productFrom = new Date(product.availableFrom);
      productFrom.setHours(0, 0, 0, 0);
      
      const productUntil = new Date(product.availableUntil);
      productUntil.setHours(0, 0, 0, 0);

      const isAvailable = kitStart >= productFrom && kitEnd <= productUntil;
      if (!isAvailable) invalidTitles.push(product.title);
    });

    return invalidTitles;
};

  const validate = (isDraft: boolean = false): {
    valid: boolean;
    payloadDates?: { startIso: string; endIso: string };
  } => {
    const nextErrors: FormErrors = {};

    // Validación de nombre
    if (!name.trim()) {
      nextErrors.name = "El nombre del kit es obligatorio.";
    } else if (name.trim().length > MAX_KIT_NAME_LENGTH) {
      nextErrors.name = `El nombre no puede superar los ${MAX_KIT_NAME_LENGTH} caracteres.`;
    }
    
    // Validación de fechas
    if (!startDate) nextErrors.startDate = "Debes seleccionar una fecha inicial.";
    if (!endDate) nextErrors.endDate = "Debes seleccionar una fecha final.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate && startDate < today) {
      nextErrors.startDate = "La fecha de inicio no puede ser pasada.";
    }

    if (endDate && endDate < today) {
      nextErrors.endDate = "La fecha de fin no puede ser pasada.";
    }

    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = "La fecha de fin debe ser posterior a la de inicio.";
    }

    // Validaciones para no borrador
    if (!isDraft) {
      if (!country.trim()) nextErrors.country = "El país es obligatorio.";
      if (!city.trim()) nextErrors.city = "La ciudad es obligatoria.";

      // Validación de punto de encuentro
      if (deliveryMethod === "MEETING_POINT") {
        if (!meetingPoint.trim()) {
          nextErrors.meetingPoint = "Debes indicar un punto de encuentro.";
        } else if (meetingPoint.trim().length > MAX_MEETING_POINT_LENGTH) {
          nextErrors.meetingPoint = `El punto de encuentro no puede superar los ${MAX_MEETING_POINT_LENGTH} caracteres.`;
        }
      }
      
      // Validación de dirección de mensajería
      if (deliveryMethod === "COURIER") {
        if (!courierAddress.trim()) {
          nextErrors.courierAddress = "Debes indicar una dirección de entrega.";
        } else if (courierAddress.trim().length > MAX_COURIER_ADDRESS_LENGTH) {
          nextErrors.courierAddress = `La dirección no puede superar los ${MAX_COURIER_ADDRESS_LENGTH} caracteres.`;
        }
      }

      // Validación de productos seleccionados
      if (selectedItemsCount === 0) {
        nextErrors.items = "Debes añadir al menos un producto.";
      } else if (startDate && endDate) {
        const invalidItems = checkItemsAvailability(startDate, endDate);
        if (invalidItems.length > 0) {
          nextErrors.items = "No puedes realizar el pedido: hay productos no disponibles en estas fechas.";
        }
      }
    } else {
      // Para borrador, solo advertir sobre fechas
      if (startDate && endDate) {
        const invalidItems = checkItemsAvailability(startDate, endDate);
        if (invalidItems.length > 0) {
          setErrors(prev => ({ ...prev, items: `Aviso: Algunos artículos no están disponibles en estas fechas.` }));
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

    // Validación explícita de nombre antes de cualquier otra cosa
    if (name.trim().length === 0) {
      setErrors({ name: "El nombre del kit es obligatorio." });
      return;
    }
    
    if (name.trim().length > MAX_KIT_NAME_LENGTH) {
      setErrors({ name: `El nombre no puede superar los ${MAX_KIT_NAME_LENGTH} caracteres.` });
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
      meetingPoint: deliveryMethod === "MEETING_POINT" ? meetingPoint.trim() : courierAddress.trim(),
      tenantId: user.id,
      status: KitStatus.DRAFT,
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

      navigation.navigate("Checkout", { kitId: createdKit.id });

    } catch (err) {
      console.error("ERROR al procesar la creación/pago del kit:", err);
      
      let errorMsg = "";
      
      // Intentar extraer el mensaje de error de diferentes formas
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      
      if ((err as any)?.response?.data) {
        const responseData = (err as any).response.data;
        
        // Para errores de validación de Spring Boot (MethodArgumentNotValidException)
        if (responseData.errors && Array.isArray(responseData.errors)) {
          // Formato de error de Spring Boot con lista de errores por campo
          const firstError = responseData.errors[0];
          const field = firstError.field;
          const message = firstError.defaultMessage || firstError.message;
          
          if (field === "name") {
            setErrors({ name: message });
          } else if (field === "country") {
            setErrors({ country: message });
          } else if (field === "city") {
            setErrors({ city: message });
          } else if (field === "meetingPoint") {
            setErrors({ meetingPoint: message });
          } else {
            setErrors({ general: message });
          }
          return;
        }
        
        // Para errores con mensaje simple en string
        if (typeof responseData === 'string') {
          errorMsg = responseData;
        } 
        // Para errores con mensaje en objeto
        else if (responseData.message) {
          errorMsg = responseData.message;
        }
        // Para errores que vienen como texto plano
        else {
          errorMsg = JSON.stringify(responseData);
        }
      }
      
      console.log("Mensaje de error completo:", errorMsg);
      
      // Si el error es el de validación de Spring Boot (formato alternativo)
      if (errorMsg.includes("Validation failed") && errorMsg.includes("name")) {
        setErrors({ name: "El nombre del kit no puede superar los 255 caracteres" });
        return;
      }
      
      // DETECCIÓN MEJORADA - Buscar errores de longitud de campo
      const lowerMsg = errorMsg.toLowerCase();
      
      // Error de nombre demasiado largo (cualquier variante)
      if (lowerMsg.includes("name") && (lowerMsg.includes("255") || lowerMsg.includes("long") || lowerMsg.includes("length") || lowerMsg.includes("max") || lowerMsg.includes("caracteres"))) {
        setErrors({ name: "El nombre del kit es demasiado largo (máximo 255 caracteres)." });
        return;
      }
      
      // Error de país demasiado largo
      if (lowerMsg.includes("country") && (lowerMsg.includes("long") || lowerMsg.includes("length") || lowerMsg.includes("max"))) {
        setErrors({ country: "El país es demasiado largo (máximo 120 caracteres)." });
        return;
      }
      
      // Error de ciudad demasiado larga
      if (lowerMsg.includes("city") && (lowerMsg.includes("long") || lowerMsg.includes("length") || lowerMsg.includes("max"))) {
        setErrors({ city: "La ciudad es demasiado larga (máximo 120 caracteres)." });
        return;
      }
      
      // Error de punto de encuentro demasiado largo
      if (lowerMsg.includes("meeting") && (lowerMsg.includes("long") || lowerMsg.includes("length") || lowerMsg.includes("max"))) {
        setErrors({ meetingPoint: "El punto de encuentro es demasiado largo (máximo 500 caracteres)." });
        return;
      }
      
      // Error de dirección demasiado larga
      if (lowerMsg.includes("courier") && (lowerMsg.includes("long") || lowerMsg.includes("length") || lowerMsg.includes("max"))) {
        setErrors({ courierAddress: "La dirección de entrega es demasiado larga (máximo 500 caracteres)." });
        return;
      }
      
      // Error de valor demasiado largo para cualquier campo (PostgreSQL genérico)
      if (lowerMsg.includes("value too long") && lowerMsg.includes("varying")) {
        setErrors({ general: "Uno de los campos supera la longitud máxima permitida. Por favor, revisa el nombre, país, ciudad o dirección." });
        return;
      }
      
      // Errores de disponibilidad de productos
      if (errorMsg.includes("ya no está disponible") || errorMsg.includes("unidades")) {
        setErrors({ items: errorMsg });
        return;
      }
      
      // Si llegamos aquí, mostrar el mensaje original o uno genérico
      setErrors({ general: errorMsg || "Ha ocurrido un error al procesar el kit o el pago." });
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
        <Helmet>
          <title>Crear un kit | KeaKit</title>
          <meta name="description" content="Crea un nuevo kit en KeaKit y personalízalo según tus necesidades."/>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>  
        <ScrollView
          contentContainerStyle={createKitStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={createKitStyles.headerRow}>
            <TouchableOpacity style={componentStyles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={[commonStyles.headerTitle, createKitStyles.headerTitle]}>
              {kitToCreate ? "Personaliza tu kit" : "Crea un kit"}
            </Text>
            <View style={componentStyles.iconButton} />
          </View>

          <PaperTextInput
            mode="outlined"
            label="Nombre del Kit"
            value={name}
            maxLength={MAX_KIT_NAME_LENGTH}
            onChangeText={(value) => {
              setName(value);
              if (value.length > MAX_KIT_NAME_LENGTH) {
                setErrors(prev => ({ ...prev, name: `El nombre no puede superar los ${MAX_KIT_NAME_LENGTH} caracteres.` }));
              } else if (value.length > 0) {
                clearFieldError("name");
              } else {
                clearFieldError("name");
              }
            }}
            onBlur={() => {
              if (name.trim().length === 0) {
                setErrors(prev => ({ ...prev, name: "El nombre del kit es obligatorio." }));
              } else if (name.trim().length > MAX_KIT_NAME_LENGTH) {
                setErrors(prev => ({ ...prev, name: `El nombre no puede superar los ${MAX_KIT_NAME_LENGTH} caracteres.` }));
              } else {
                clearFieldError("name");
              }
            }}
            error={!!errors.name}
            style={{ backgroundColor: Colors.backgroundWhite }}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            right={
              <PaperTextInput.Affix 
                text={`${name.length}/${MAX_KIT_NAME_LENGTH}`}
                textStyle={{ 
                  fontSize: 12,
                  color: name.length === MAX_KIT_NAME_LENGTH ? Colors.error : Colors.textSecondary 
                }}
              />
            }
          />
          {errors.name ? <Text style={commonStyles.errorText}>{errors.name}</Text> : null}

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
            <View style={[styles.pickerWrapper, errors.city ? styles.pickerWrapperError : null]}>
              <Ionicons name="location-outline" size={18} color={Colors.textSecondary} style={styles.pickerIcon} />
              {loadingCities ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1 }} />
              ) : (
                <SelectPicker
                  options={cities.map((c) => ({ label: c, value: c }))}
                  selectedValue={selectedCity}
                  placeholder={selectedCountry ? "Selecciona una ciudad" : "Primero elige un país"}
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
              { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
            ]}
            onPress={() => setShowDateRangePicker(true)}
          >
            <Text style={{ color: startDate && endDate ? Colors.textPrimary : Colors.textSecondary }}>
              {startDate && endDate
                ? `${String(startDate.getDate()).padStart(2, "0")}/${String(startDate.getMonth() + 1).padStart(2, "0")}/${startDate.getFullYear()} - ${String(endDate.getDate()).padStart(2, "0")}/${String(endDate.getMonth() + 1).padStart(2, "0")}/${endDate.getFullYear()}`
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
            validRange={{ startDate: new Date() }}
            onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
              setShowDateRangePicker(false);
              if (params.startDate && params.endDate) {
                const invalidItems = checkItemsAvailability(params.startDate, params.endDate);
                if (invalidItems.length > 0) {
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

          {errors.startDate && <Text style={commonStyles.errorText}>{errors.startDate}</Text>}
          {errors.endDate && <Text style={commonStyles.errorText}>{errors.endDate}</Text>}

          {monthsBetween !== null && monthsBetween > 0 && (
            <View style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={commonStyles.bodySecondary}>
                Duración: {startDate && endDate ? formatRentalDuration(startDate, endDate) : ""}
              </Text>
            </View>
          )}

          <View style={createKitStyles.deliverySection}>
            <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>Método de entrega</Text>
            <SegmentedButtons
              value={deliveryMethod}
              onValueChange={(value) => {
                setDeliveryMethod(value as DeliveryMethod);
                clearFieldError("meetingPoint");
                clearFieldError("courierAddress");
              }}
              buttons={[
                { value: "COURIER", label: "Mensajería", icon: "truck-delivery" },
                { value: "MEETING_POINT", label: "Punto de encuentro", icon: "map-marker" },
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
                  maxLength={MAX_MEETING_POINT_LENGTH}
                  onChangeText={(value) => {
                    setMeetingPoint(value);
                    clearFieldError("meetingPoint");
                  }}
                  onBlur={() => {
                    if (deliveryMethod === "MEETING_POINT" && meetingPoint.trim().length > 0 && meetingPoint.trim().length <= MAX_MEETING_POINT_LENGTH) {
                      clearFieldError("meetingPoint");
                    }
                  }}
                  error={!!errors.meetingPoint}
                  style={{ backgroundColor: Colors.backgroundWhite, marginTop: 12 }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                  multiline
                  right={
                    <PaperTextInput.Affix 
                      text={`${meetingPoint.length}/${MAX_MEETING_POINT_LENGTH}`}
                      textStyle={{ 
                        fontSize: 12,
                        color: meetingPoint.length === MAX_MEETING_POINT_LENGTH ? Colors.error : Colors.textSecondary 
                      }}
                    />
                  }
                />
                {errors.meetingPoint && <Text style={commonStyles.errorText}>{errors.meetingPoint}</Text>}
              </>
            ) : (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="Dirección de entrega"
                  value={courierAddress}
                  maxLength={MAX_COURIER_ADDRESS_LENGTH}
                  onChangeText={(value) => {
                    setCourierAddress(value);
                    clearFieldError("courierAddress");
                  }}
                  onBlur={() => {
                    if (deliveryMethod === "COURIER" && courierAddress.trim().length > 0 && courierAddress.trim().length <= MAX_COURIER_ADDRESS_LENGTH) {
                      clearFieldError("courierAddress");
                    }
                  }}
                  error={!!errors.courierAddress}
                  style={{ backgroundColor: Colors.backgroundWhite, marginTop: 12 }}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                  multiline
                  right={
                    <PaperTextInput.Affix 
                      text={`${courierAddress.length}/${MAX_COURIER_ADDRESS_LENGTH}`}
                      textStyle={{ 
                        fontSize: 12,
                        color: courierAddress.length === MAX_COURIER_ADDRESS_LENGTH ? Colors.error : Colors.textSecondary 
                      }}
                    />
                  }
                />
                {errors.courierAddress && <Text style={commonStyles.errorText}>{errors.courierAddress}</Text>}
                <Text style={commonStyles.bodySecondary}>
                  Se aplicará una tarifa fija de mensajería de {PLATFORM_COURIER_PRICE.toFixed(2)}€ al total del kit.
                </Text>
              </>
            )}
          </View>

          <View style={createKitStyles.productsHeader}>
            <Text style={[commonStyles.subtitle, createKitStyles.productsTitle]}>Tus Productos</Text>
            {isEditable && (
              <Button
                mode="contained"
                onPress={openAddProductModal}
                icon="plus"
                compact
                style={{ borderRadius: 8 }}
              >
                {selectedItemsCount > 0 ? "Añadir más productos" : "Añadir producto"}
              </Button>
            )}
          </View>

          <View style={createKitStyles.counterBadge}>
            <Text style={createKitStyles.counterBadgeText}>Seleccionados: {selectedItemsCount}</Text>
          </View>

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
                item={{
                  id: item.id,
                  title: item.title,
                  city: item.city,
                  pricePerMonth: item.pricePerMonth,
                  totalUnits: item.totalUnits,
                  imageUrl: item.imageUrl,
                  category: item.category,
                  ownerName: item.ownerName,
                  condition: item.condition,
                }}
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

          {errors.items && <Text style={commonStyles.errorText}>{errors.items}</Text>}
          {errors.general && <Text style={commonStyles.errorText}>{errors.general}</Text>}
        </ScrollView>

        <View style={createKitStyles.footerRow}>
          <View style={{ flex: 1 }}>
            <KitPaymentResumeComponent kitPrices={kitPayment} />

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
              <Text style={[commonStyles.body, { fontWeight: "bold" }]}>{walletBalance.toFixed(2)}€</Text>
            </View>

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
                  meetingPoint: deliveryMethod === "MEETING_POINT" ? meetingPoint.trim() : courierAddress.trim(),
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

        <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={{ width: "100%", backgroundColor: "white", borderRadius: 16, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#111" }}>Depósito de garantía</Text>
              <Text style={{ fontSize: 15, color: "#444", marginBottom: 20 }}>
                Recuerda que el 20% se retendrá como garantía y se te devolverá cuando el kit sea devuelto en buen estado.
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                <Button mode="outlined" onPress={() => setConfirmVisible(false)}>Cancelar</Button>
                <Button mode="contained" onPress={() => { setConfirmVisible(false); handleSubmit(); }}>Aceptar</Button>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default CreateKitScreen;
