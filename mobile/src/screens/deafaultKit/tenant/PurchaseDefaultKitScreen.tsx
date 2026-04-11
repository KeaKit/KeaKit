import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerModal, es, registerTranslation } from "react-native-paper-dates";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  TextInput as PaperTextInput,
  Button,
  SegmentedButtons,
} from "react-native-paper";

registerTranslation("es", es);

import { useLocationPicker } from "../../../hooks/useLocationPicker";
import { useAuth } from "../../../context/AuthContext";
import { createKit } from "../../../services/kitService";
import { processPaymentWithWallet } from "../../../services";
import { API_ROUTES } from "../../../config/api";
import {
  RootStackParamList,
  KitCreateRequest,
  KitStatus,
  DefaultKit,
} from "../../../types";
import { Colors, commonStyles } from "../../../styles";

// Componentes
import { SelectPicker } from "../../../components/SelectPicker";
import { KitPaymentResumeComponent } from "../../../components/KitPaymentResumeComponent";
import { formatRentalDuration, calculateMonthsBetween } from "../../../utils/duration";

const COMISION = 0;
const GUARANTEE_PERCENTAGE = 0.2;
const PLATFORM_COURIER_PRICE = 9.99;

type PurchaseDefaultKitNav = NativeStackNavigationProp<RootStackParamList, "PurchaseDefaultKit">;
type PurchaseDefaultKitRoute = RouteProp<RootStackParamList, "PurchaseDefaultKit">;

type FormErrors = {
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  meetingPoint?: string;
  courierAddress?: string;
  general?: string;
};


const PurchaseDefaultKitScreen: React.FC = () => {
  const navigation = useNavigation<PurchaseDefaultKitNav>();
  const route = useRoute<PurchaseDefaultKitRoute>();
  const { user } = useAuth();
  
  // Recibimos el ID del kit desde el catálogo
  const { kitId } = route.params;

  // Ya no es una lista, es solo EL kit que hemos seleccionado
  const [selectedKit, setSelectedKit] = useState<DefaultKit | null>(null);
  const [loadingKit, setLoadingKit] = useState(true);

  // Estados del formulario
  const {
    selectedCountry,
    selectedCity,
    setSelectedCity,
    cities,
    countries,
    loadingCities,
    onCountryChange,
  } = useLocationPicker();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"COURIER" | "MEETING_POINT">("COURIER");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [courierAddress, setCourierAddress] = useState("");

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"WALLET" | "NORMAL">("NORMAL");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Carga SOLO el kit seleccionado y el wallet
  // Carga el kit seleccionado y el wallet
  useEffect(() => {
    const fetchSpecificData = async () => {
      if (!user?.token) return;
      try {
        setLoadingKit(true);
        
        // 1. Usamos el endpoint general que SABEMOS que funciona (Evitamos el error 500)
        const kitRes = await fetch(API_ROUTES.DEFAULT_KITS, { 
            headers: { Authorization: `Bearer ${user.token}` },
        });

        if (kitRes.ok) {
          const allKits = await kitRes.json();
          // Buscamos el kit exacto que el usuario seleccionó en la pantalla anterior
          const targetKit = allKits.find((k: any) => k.id === kitId);
          
          if (targetKit) {
            setSelectedKit(targetKit);
          } else {
            console.error("Kit no encontrado en la lista del backend");
          }
        } else {
          console.error("Error al cargar los kits:", kitRes.status);
        }

        // 2. Cargar Wallet
        const walletRes = await fetch(API_ROUTES.GET_WALLET_BY_USER_ID(user.id), {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
      } catch (error) {
        console.error("Error de red cargando datos:", error);
      } finally {
        setLoadingKit(false);
      }
    };
    fetchSpecificData();
  }, [user?.token, user?.id, kitId]);
  
  const monthsBetween = useMemo(() => {
    if (!startDate || !endDate) return null;
    return calculateMonthsBetween(startDate, endDate);
  }, [startDate, endDate]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const totalPrice = useMemo(() => {
    if (!selectedKit || monthsBetween === null) return 0;
    return selectedKit.basePrice * monthsBetween;
  }, [selectedKit, monthsBetween]);

  const kitPayment = useMemo(() => {
    const subtotal = Math.round(totalPrice * 100);
    const guarantee = Math.round(subtotal * GUARANTEE_PERCENTAGE);
    const platformfee = Math.round(subtotal * COMISION);
    const courier = deliveryMethod === "COURIER" ? Math.round(PLATFORM_COURIER_PRICE * 100) : 0;
    const total = subtotal + guarantee + platformfee + courier;

    return {
      subtotalPrice: subtotal,
      guarantee,
      platformfee,
      courierPrice: courier,
      totalPrice: total,
    };
  }, [totalPrice, deliveryMethod]);

  const finalPrice = kitPayment.totalPrice / 100;

  const checkAvailability = (start: Date, end: Date) => {
    if (!selectedKit || !selectedKit.items) return [];
    const invalidTitles: string[] = [];
    const kitStartNum = start.getFullYear() * 10000 + (start.getMonth() + 1) * 100 + start.getDate();
    const kitEndNum = end.getFullYear() * 10000 + (end.getMonth() + 1) * 100 + end.getDate();

    // Modificado para usar la estructura correcta del DTO
    selectedKit.items.forEach((kItem: any) => {
      // kItem puede tener la información en kItem o en kItem.item dependiendo de cómo responda este endpoint
      const itemData = kItem.item || kItem; 
      
      if (!itemData.availableFrom || !itemData.availableUntil) return;
      
      const rawFrom = itemData.availableFrom.split('T')[0];
      const rawUntil = itemData.availableUntil.split('T')[0];
      const fromParts = rawFrom.split('-');
      const untilParts = rawUntil.split('-');
      const pStartNum = parseInt(fromParts[0]) * 10000 + parseInt(fromParts[1]) * 100 + parseInt(fromParts[2]);
      const pEndNum = parseInt(untilParts[0]) * 10000 + parseInt(untilParts[1]) * 100 + parseInt(untilParts[2]);

      if (!(kitStartNum >= pStartNum && kitEndNum <= pEndNum)) {
        invalidTitles.push(itemData.title || itemData.name);
      }
    });
    return invalidTitles;
  };

  const validate = (): { valid: boolean; payloadDates?: { startIso: string; endIso: string } } => {
    const nextErrors: FormErrors = {};
    if (!startDate) nextErrors.startDate = "Selecciona una fecha inicial.";
    if (!endDate) nextErrors.endDate = "Selecciona una fecha final.";
    if (!country.trim()) nextErrors.country = "El país es obligatorio.";
    if (!city.trim()) nextErrors.city = "La ciudad es obligatoria.";

    if (deliveryMethod === "MEETING_POINT" && !meetingPoint.trim()) {
      nextErrors.meetingPoint = "Indica un punto de encuentro.";
    }
    if (deliveryMethod === "COURIER" && !courierAddress.trim()) {
      nextErrors.courierAddress = "Indica una dirección de entrega.";
    }

    if (startDate && endDate) {
      const invalidItems = checkAvailability(startDate, endDate);
      if (invalidItems.length > 0) {
        nextErrors.general = `Artículos no disponibles en esas fechas: ${invalidItems.join(", ")}`;
      }
    }

    setErrors(prev => ({ ...prev, ...nextErrors }));
    if (Object.keys(nextErrors).length > 0 || !startDate || !endDate) return { valid: false };

    const startIso = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const endIso = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
    return { valid: true, payloadDates: { startIso, endIso } };
  };

  const handleSubmit = async () => {
    if (!user?.id || !user.token || !selectedKit) return;
    const validation = validate();
    if (!validation.valid || !validation.payloadDates) return;

    // Adaptamos el mapeo para que soporte tanto item.item.id como item.id
    const mappedSelections = (selectedKit.items || []).map((kItem: any) => {
       const itemData = kItem.item || kItem;
       return {
         itemId: itemData.id,
         quantity: 1, 
         pricePerMonth: itemData.pricePerMonth || itemData.priceAtRental || 0,
       };
    });

    const payload: KitCreateRequest = {
      name: selectedKit.name,
      country: country.trim(),
      city: city.trim(),
      startDate: validation.payloadDates.startIso,
      endDate: validation.payloadDates.endIso,
      deliveryMethod,
      meetingPoint: deliveryMethod === "MEETING_POINT" ? meetingPoint.trim() : courierAddress.trim(),
      tenantId: user.id,
      status: KitStatus.DRAFT,
      itemSelections: mappedSelections,
    };

    try {
      setSubmitting(true);
      const createdKit = await createKit(payload, user.token);
      if (!createdKit) throw new Error("No se pudo crear el pedido.");

      if (paymentType === "WALLET") {
        await processPaymentWithWallet(createdKit.id, user.token, kitPayment.totalPrice);
        navigation.navigate("MyKits");
      } else {
        navigation.navigate("Checkout", { kitId: createdKit.id });
      }
    } catch (error) {
      const errorType = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const errorMsg = errorType.response?.data?.message || errorType.message || "";
      if (errorMsg.includes("ya no está disponible") || 
                errorMsg.includes("unidades"))
      {
        setErrors({ general:errorMsg }); 
      console.error("Error al procesar el kit:", error);
      }else{
        setErrors({ general: "Ha ocurrido un error al procesar el pedido." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const customTheme = {
    ...MD3LightTheme,
    colors: { ...MD3LightTheme.colors, primary: Colors.primary, primaryContainer: "#E3F2FD" },
  };

  // Si está cargando, mostramos spinner centrado
  if (loadingKit) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Cargando Kit</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Si hubo un error y no hay kit
  if (!selectedKit) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Error</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={commonStyles.centerContent}>
          <Text style={commonStyles.bodySecondary}>No se ha podido cargar el kit.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- VISTA PRINCIPAL: FORMULARIO DE PAGO/CONFIGURACIÓN (Copiada tal cual) ---
  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        {/* Header utilizando tu commonStyles.header */}
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Configura tu Kit</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={commonStyles.screenPadding} keyboardShouldPersistTaps="handled">
          
          <View style={[commonStyles.cardSmall, commonStyles.marginTopLg, commonStyles.marginBottomLg, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[commonStyles.bodyPrimary, { fontWeight: 'bold', color: Colors.primary }]}>{selectedKit.name}</Text>
            <Text style={[commonStyles.bodySecondary, commonStyles.marginTopSm]}>
              Incluye {(selectedKit.items || selectedKit.items || []).length} productos preseleccionados listos para alquilar.
            </Text>
          </View>

          {/* País */}
          <View style={commonStyles.marginBottomMd}>
            <Text style={[commonStyles.bodyPrimary, { fontWeight: 'bold', marginBottom: 5 }]}>País</Text>
            <View style={[commonStyles.input, { paddingVertical: 0, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center' }, errors.country ? commonStyles.inputError : null]}>
              <Ionicons name="earth-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
              <View style={{ flex: 1 }}>
                <SelectPicker
                  options={countries}
                  selectedValue={selectedCountry}
                  placeholder="Selecciona un país"
                  onValueChange={(value: string) => {
                    onCountryChange(value);
                    setCountry(value);
                    clearFieldError("country");
                    clearFieldError("city");
                  }}
                />
              </View>
            </View>
            {!!errors.country && (
              <View style={commonStyles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.country}</Text>
              </View>
            )}
          </View>

          {/* Ciudad */}
          <View style={commonStyles.marginBottomMd}>
            <Text style={[commonStyles.bodyPrimary, { fontWeight: 'bold', marginBottom: 5 }]}>Ciudad</Text>
            <View style={[commonStyles.input, { paddingVertical: 0, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center' }, errors.city ? commonStyles.inputError : null]}>
              <Ionicons name="location-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
              {loadingCities ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ flex: 1, marginVertical: 15 }} />
              ) : (
                <View style={{ flex: 1 }}>
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
                </View>
              )}
            </View>
            {!!errors.city && (
              <View style={commonStyles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={commonStyles.errorText}>{errors.city}</Text>
              </View>
            )}
          </View>

          {/* Fechas */}
          <TouchableOpacity
            style={[commonStyles.input, (errors.startDate || errors.endDate) ? commonStyles.inputError : null, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }]}
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
            onConfirm={(params: { startDate?: Date; endDate?: Date }) => {
              setShowDateRangePicker(false);
              if (params.startDate && params.endDate) {
                const invalidItems = checkAvailability(params.startDate, params.endDate);
                if (invalidItems.length > 0) {
                  setErrors((prev) => ({ ...prev, general: `Atención: Artículos no disponibles en esas fechas: ${invalidItems.join(", ")}` }));
                } else {
                  clearFieldError("general");
                }
                setStartDate(params.startDate);
                setEndDate(params.endDate);
                clearFieldError("startDate");
                clearFieldError("endDate");
              }
            }}
          />
          {errors.startDate && (
            <View style={[commonStyles.errorContainer, { marginTop: -10, marginBottom: 10 }]}>
              <Ionicons name="alert-circle" size={14} color={Colors.error} />
              <Text style={commonStyles.errorText}>{errors.startDate}</Text>
            </View>
          )}

          {monthsBetween !== null && monthsBetween > 0 && (
            <View style={commonStyles.marginBottomMd}>
              <Text style={commonStyles.bodySecondary}>
                Duración: {startDate && endDate ? formatRentalDuration(startDate, endDate) : ""}
              </Text>
            </View>
          )}

          {/* Método de Entrega */}
          <View style={commonStyles.marginBottomLg}>
            <Text style={commonStyles.subtitle}>Método de entrega</Text>
            <SegmentedButtons
              value={deliveryMethod}
              onValueChange={(value) => {
                setDeliveryMethod(value as "COURIER" | "MEETING_POINT");
                clearFieldError("meetingPoint");
                clearFieldError("courierAddress");
              }}
              buttons={[
                { value: "COURIER", label: "Mensajería", icon: "truck-delivery" },
                { value: "MEETING_POINT", label: "Punto de encuentro", icon: "map-marker" },
              ]}
              style={{ marginVertical: 12 }}
            />

            {deliveryMethod === "MEETING_POINT" && (
              <PaperTextInput
                mode="outlined"
                label="Punto de encuentro"
                value={meetingPoint}
                onChangeText={(v) => { setMeetingPoint(v); clearFieldError("meetingPoint"); }}
                error={!!errors.meetingPoint}
                style={{ backgroundColor: Colors.backgroundWhite, marginTop: 12 }}
              />
            )}

            {deliveryMethod === "COURIER" && (
              <PaperTextInput
                mode="outlined"
                label="Dirección de entrega"
                value={courierAddress}
                onChangeText={(v) => { setCourierAddress(v); clearFieldError("courierAddress"); }}
                error={!!errors.courierAddress}
                style={{ backgroundColor: Colors.backgroundWhite, marginTop: 12 }}
              />
            )}
          </View>

          {errors.general ? (
             <View style={commonStyles.errorContainer}>
               <Ionicons name="alert-circle" size={14} color={Colors.error} />
               <Text style={commonStyles.errorText}>{errors.general}</Text>
             </View>
          ) : null}

        </ScrollView>

        {/* Footer utilizando tu commonStyles.footerContainer */}
        <View style={commonStyles.footerContainer}>
          <View style={{ width: '100%' }}>
            <KitPaymentResumeComponent kitPrices={kitPayment} />

            <View style={[commonStyles.cardSmall, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
                <Text style={commonStyles.bodyPrimary}>Saldo en cartera</Text>
              </View>
              <Text style={[commonStyles.bodyPrimary, { fontWeight: "bold" }]}>{walletBalance.toFixed(2)}€</Text>
            </View>

            <Button
              mode="contained"
              buttonColor={Colors.primary}
              disabled={submitting || walletBalance < finalPrice || finalPrice === 0}
              onPress={() => { setPaymentType("WALLET"); setConfirmVisible(true); }}
              icon="wallet"
              style={{ borderRadius: 8, marginBottom: 8 }}
            >
              {walletBalance >= finalPrice ? "Pagar con Cartera" : "Saldo insuficiente"}
            </Button>

            <Button
              mode="contained"
              onPress={() => { setPaymentType("NORMAL"); setConfirmVisible(true); }}
              disabled={submitting || finalPrice === 0}
              loading={submitting}
              icon="cart-outline"
              style={{ borderRadius: 8 }}
            >
              Realizar Pedido
            </Button>
          </View>
        </View>

        {/* Modal Confirmación */}
        <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={commonStyles.card}>
              <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 10 }]}>Depósito de garantía</Text>
              <Text style={[commonStyles.bodySecondary, { marginBottom: 20 }]}>
                Recuerda que el 20% se retendrá como garantía y se te devolverá cuando devuelvas el kit en buen estado.
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

export default PurchaseDefaultKitScreen;
