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
import { useNavigation } from "@react-navigation/native";
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

import { useLocationPicker } from "../../hooks/useLocationPicker";
import { useAuth } from "../../context/AuthContext";
import { createKit } from "../../services/kitService";
import { processPaymentWithWallet } from "../../services";
import { API_ROUTES } from "../../config/api";
import {
  RootStackParamList,
  KitCreateRequest,
  KitStatus,
  DefaultKit,
} from "../../types";
import { Colors, commonStyles } from "../../styles";

// Componentes
import { SelectPicker } from "../../components/SelectPicker";
import { KitPaymentResumeComponent } from "../../components/KitPaymentResumeComponent";

const COMISION = 0;
const GUARANTEE_PERCENTAGE = 0.2;
const PLATFORM_COURIER_PRICE = 9.99;

type PurchaseDefaultKitNav = NativeStackNavigationProp<RootStackParamList & { PurchaseDefaultKit: undefined }, "PurchaseDefaultKit">;

type FormErrors = {
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  meetingPoint?: string;
  courierAddress?: string;
  general?: string;
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

const PurchaseDefaultKitScreen: React.FC = () => {
  const navigation = useNavigation<PurchaseDefaultKitNav>();
  const { user } = useAuth();

  // Estados de datos
  const [defaultKits, setDefaultKits] = useState<DefaultKit[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);
  const [selectedKit, setSelectedKit] = useState<DefaultKit | null>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        setLoadingKits(true);
        
        console.log("1. Llamando a:", API_ROUTES.DEFAULT_KITS_CATALOG);
        
        const kitsRes = await fetch(API_ROUTES.DEFAULT_KITS_CATALOG, { 
            headers: { Authorization: `Bearer ${user.token}` },
        });

        console.log("2. Status de la respuesta:", kitsRes.status);

        if (kitsRes.ok) {
          const kitsData = await kitsRes.json();
          console.log("3. Datos recibidos:", JSON.stringify(kitsData, null, 2));
          setDefaultKits(kitsData);
        } else {
          const errorText = await kitsRes.text();
          console.log("3. Error del backend:", errorText);
        }

        // Lo del wallet lo dejamos igual
        const walletRes = await fetch(API_ROUTES.GET_WALLET_BY_USER_ID(user.id), {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        }
      } catch (error) {
        console.error("Error de red/código cargando datos:", error);
      } finally {
        setLoadingKits(false);
      }
    };
    fetchData();
  }, [user?.token, user?.id]);
  
  const monthsBetween = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
    const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
    return calculateMonthsBetween(start, end);
  }, [startDate, endDate]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const totalPrice = useMemo(() => {
    if (!selectedKit || monthsBetween === null) return 0;
    return selectedKit.basePrice * monthsBetween;
  }, [selectedKit, monthsBetween]);

  const courierPrice = deliveryMethod === "COURIER" ? PLATFORM_COURIER_PRICE : 0;

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
    if (!selectedKit) return [];
    const invalidTitles: string[] = [];
    const kitStartNum = start.getFullYear() * 10000 + (start.getMonth() + 1) * 100 + start.getDate();
    const kitEndNum = end.getFullYear() * 10000 + (end.getMonth() + 1) * 100 + end.getDate();

    selectedKit.items.forEach(({ item }) => {
      if (!item.availableFrom || !item.availableUntil) return;
      const rawFrom = item.availableFrom.split('T')[0];
      const rawUntil = item.availableUntil.split('T')[0];
      const fromParts = rawFrom.split('-');
      const untilParts = rawUntil.split('-');
      const pStartNum = parseInt(fromParts[0]) * 10000 + parseInt(fromParts[1]) * 100 + parseInt(fromParts[2]);
      const pEndNum = parseInt(untilParts[0]) * 10000 + parseInt(untilParts[1]) * 100 + parseInt(untilParts[2]);

      if (!(kitStartNum >= pStartNum && kitEndNum <= pEndNum)) {
        invalidTitles.push(item.title);
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
      itemSelections: selectedKit.items.map((kItem) => ({
        itemId: kItem.item.id,
        quantity: 1, 
        pricePerMonth: kItem.item.pricePerMonth,
      })),
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
      console.error("Error al procesar el kit:", error);
      setErrors({ general: "Ha ocurrido un error al procesar el pedido." });
    } finally {
      setSubmitting(false);
    }
  };

  const customTheme = {
    ...MD3LightTheme,
    colors: { ...MD3LightTheme.colors, primary: Colors.primary, primaryContainer: "#E3F2FD" },
  };

  // --- VISTA 1: LISTADO DE KITS PREDETERMINADOS ---
  if (!selectedKit) {
    return (
      <SafeAreaView style={commonStyles.container}>
        {/* Header utilizando tu commonStyles.header */}
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Kits Recomendados</Text>
          <View style={{ width: 24 }} />
        </View>

        {loadingKits ? (
          <View style={commonStyles.centerContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : defaultKits.length === 0 ? (
          <View style={commonStyles.centerContent}>
            <Ionicons name="cube-outline" size={60} color={Colors.textSecondary} />
            <Text style={[commonStyles.bodySecondary, commonStyles.marginTopMd, { textAlign: 'center' }]}>
              No hay kits predeterminados disponibles en este momento.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={commonStyles.screenPadding}>
            <Text style={[commonStyles.bodySecondary, commonStyles.marginTopLg, commonStyles.marginBottomLg]}>
              Selecciona uno de nuestros kits listos para usar y personaliza las fechas de tu alquiler.
            </Text>
            {defaultKits.map((kit) => (
              <TouchableOpacity
                key={kit.id}
                onPress={() => setSelectedKit(kit)}
                style={[commonStyles.cardSmall, commonStyles.marginBottomMd, { flexDirection: "row", alignItems: "center" }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.bodyPrimary, { fontWeight: "bold", fontSize: 18 }]}>{kit.name}</Text>
                  <Text style={[commonStyles.bodySecondary, commonStyles.marginTopSm]}>
                    {kit.description}
                  </Text>
                  <Text style={[commonStyles.caption, commonStyles.marginTopSm]}>
                    Contiene {kit.items.length} artículos
                  </Text>
                  <Text style={[commonStyles.bodyPrimary, { fontWeight: "bold", color: Colors.primary, marginTop: 8 }]}>
                    Base: {kit.basePrice.toFixed(2)}€/mes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // --- VISTA 2: FORMULARIO DE PAGO/CONFIGURACIÓN ---
  return (
    <PaperProvider theme={customTheme}>
      <SafeAreaView style={commonStyles.container}>
        {/* Header utilizando tu commonStyles.header */}
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => setSelectedKit(null)}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Configura tu Kit</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={commonStyles.screenPadding} keyboardShouldPersistTaps="handled">
          
          <View style={[commonStyles.cardSmall, commonStyles.marginTopLg, commonStyles.marginBottomLg, { backgroundColor: '#E3F2FD' }]}>
            <Text style={[commonStyles.bodyPrimary, { fontWeight: 'bold', color: Colors.primary }]}>{selectedKit.name}</Text>
            <Text style={[commonStyles.bodySecondary, commonStyles.marginTopSm]}>
              Incluye {selectedKit.items.length} productos preseleccionados listos para alquilar.
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
              <Text style={commonStyles.bodySecondary}>Duración: {monthsBetween.toFixed(2)} meses</Text>
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