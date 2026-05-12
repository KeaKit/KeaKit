import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { Text } from "react-native-paper";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { CommonActions, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { KitPaymentDTO, KitResponse, RootStackParamList } from "../../types";
import { useAuth } from "../../context/AuthContext";
import {
  getLoggedUserWallet,
  getKitPayment,
  getKit,
  processPaymentWithWallet,
  createPaymentIntent,
  confirmStripePayment,
  processPaymentWithStripe,
  getServiceById,
} from "../../services";
import { getKitPaymentWithPromo } from "../../services/kitService";
import { toggleRent } from "../../services/articleService";
import {
  processPaymentWithWalletPromo,
  processPaymentWithStripePromo,
} from "../../services/paymentService";
import { validatePromoCode } from "../../services/promoCodeService";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  commonStyles,
  FontSizes,
  Shadows,
  Spacing,
} from "../../styles";
import { LinearGradient } from "expo-linear-gradient";
import {
  Header,
  ItemPaymentComponent,
  KitPaymentResumeComponent,
  KeakitButton,
  KeakitModal,
  FadeInItem,
} from "../../components";
import { Ionicons } from "@expo/vector-icons";

type Item = {
  itemId: number;
  ownerId: number;
  quantity: number;
  pricePerMonth: number;
  name: string;
  category: string;
  imageUrl: string;
  ownerName: string;
};
import { Helmet } from 'react-helmet-async'; 


type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;
type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route }: Props) {
  const { kitId } = route.params;
  const navigation = useNavigation<CheckoutNav>();
  const resetToMyKits = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "Home" }, { name: "MyKits" }],
      }),
    );
  };
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [enoughBalance, setEnoughBalance] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [kitDetails, setKitDetails] = useState<KitResponse>();
  const [kitPrices, setKitPrices] = useState<KitPaymentDTO | null>(null);

  // Promo
  const [promoInput,      setPromoInput]      = useState('');
  const [appliedPromo,    setAppliedPromo]     = useState<string | null>(null);
  const [promoMessage,    setPromoMessage]     = useState<{ text: string; valid: boolean } | null>(null);
  const [promoLoading,    setPromoLoading]     = useState(false);

  const isPromoApplied = appliedPromo !== null;

  const isStripePayDisabled =
    !stripe ||
    loading ||
    !cardComplete ||
    !elements ||
    elements?.getElement(CardElement) === null;
  const isWalletPayDisabled = loading || !enoughBalance;

  const showErrorModal = (message: string) => {
    setError(message);
    setErrorModalVisible(true);
  };

  async function fetchBalance() {
    if (user?.id && user?.token) {
      try {
        const wallet = await getLoggedUserWallet(user.token);
        setBalance(wallet.balance);
      } catch (error) {
        console.error("Error al cargar el saldo:", error);
        setBalance(0);
        setEnoughBalance(false);
        showErrorModal("No se pudo cargar el saldo de tu wallet.");
      }
    }
  }

  async function fetchKitPrice(promo?: string) {
    try {
      let response: KitPaymentDTO;
      if (promo && user?.email && user?.token) {
        response = await getKitPaymentWithPromo(kitId, user.token, promo, user.email);
      } else {
        response = await getKitPayment(kitId, user?.token ?? "");
      }
      setKitPrices(response);
      console.log("Respuesta al obtener el monto del kit:", response);
      return response;
    } catch (error) {
      console.error("Error al obtener el monto del kit:", error);
      showErrorModal(
        "Ha ocurrido un error al obtener el importe del kit.\n" +
          (error as Error).message,
      );
      throw error;
    }
  }

  function calculateEnoughBalance(prices?: KitPaymentDTO) {
    const currentPrices = prices ?? kitPrices;
    if (currentPrices?.totalPrice == null) {
      setEnoughBalance(false);
      return;
    }

    const balanceInCents = Math.round(balance * 100);
    setEnoughBalance(balanceInCents >= currentPrices.totalPrice);
  }

  async function fetchKitDetails() {
    try {
      const res = await getKit(kitId, user?.token ?? "");
      setKitDetails(res);
    } catch {
      // silencioso
    }
  }

  useEffect(() => { fetchBalance(); }, [user?.id, user?.token]);

  useEffect(() => {
    const init = async () => {
      await fetchBalance();
      const prices = await fetchKitPrice();
      calculateEnoughBalance(prices);
      await fetchKitDetails();
    };
    init();
  }, [kitId]);

  useEffect(() => {
    calculateEnoughBalance();
  }, [balance, kitPrices]);

  const handleRemovePromo = async () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMessage(null);
    const prices = await fetchKitPrice();
    calculateEnoughBalance(prices);
  };

  //  Pago
  const executeStripePayment = async (totalPrice: number) => {
    console.log("Procesando pago con Stripe...");
    setLoading(true);

    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !cardComplete || !elements || !cardElement) {
      console.error("Stripe o CardElement no están disponibles");
      showErrorModal("Stripe no está disponible en este momento.");
      setLoading(false);
      return;
    }
    try {
      const { clientSecret } = await createPaymentIntent(totalPrice, user?.token ?? "");
      const confirmed = await confirmStripePayment(clientSecret, cardElement, stripe);
      if (confirmed.error) return;

      if (appliedPromo && user?.email) {
        await processPaymentWithStripePromo(kitId, user.token ?? "", confirmed.paymentIntent.status, appliedPromo, user.email);
      } else {
        await processPaymentWithStripe(kitId, user?.token ?? "", confirmed.paymentIntent.status);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showErrorModal("Ha ocurrido un error durante el pago con Stripe.\n" + (err as Error).message);
      throw err;
    }
  };

  const handlePayment = async (wallet: boolean) => {
    setLoading(true);
    try {
      // Refrescar precio final justo antes de pagar
      const prices = await fetchKitPrice(appliedPromo ?? undefined);
      if (!prices || prices.totalPrice == null) throw new Error("No se pudo obtener el monto total del kit.");

      if (wallet) {
        if (appliedPromo && user?.email) {
          await processPaymentWithWalletPromo(kitId, user?.token ?? "", appliedPromo, user.email);
        } else {
          await processPaymentWithWallet(kitId, user?.token ?? "", prices.totalPrice);
        }
      } else {
        await executeStripePayment(prices.totalPrice);
      }
      resetToMyKits();
    } catch (error) {
      console.error("❌ Error:", error);
      let errorMessage =
        "Ha ocurrido un error durante el proceso de pago.\n" +
        (error as Error).message;
      if (errorMessage.includes("ya no está disponible") || 
          errorMessage.includes("unidades"))
        {
          errorMessage = errorMessage + "\n\nPor favor, vuelve atrás y elimina el artículo no disponible o modifica las fechas del kit.";
        } else if (errorMessage.includes("payment_intent")) {
          errorMessage += "\n\n¿Eres desarrollador? Este error es conocido.\nRevisa el foro de incidencias de Teams.";
        }
      
      if (errorMessage.includes("no encontrado")) {
        resetToMyKits();
        return;
      }

      showErrorModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

    const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code || !user?.email || !user?.token) return;
    setPromoLoading(true);
    try {
      const result = await validatePromoCode(user.token, code, user.email);
      if (result.valid) {
        const updatedPrices = await fetchKitPrice(code);
        setAppliedPromo(code);
        setPromoMessage({ text: `Realizado: ${result.message}`, valid: true });
        calculateEnoughBalance(updatedPrices);
      } else {
        setPromoMessage({ text: result.message, valid: false });
      }
    } catch {
      setPromoMessage({ text: 'Error al validar el código', valid: false });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Helmet>
        <title>Pagar kit | KeaKit</title>
        <meta name="description" content="Finaliza el pago de tu kit en KeaKit de forma segura con Stripe o con tu saldo disponible en la app."/>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>         
      {/* Header */}
      <Header
        title="Pagar el kit"
        showBack={true}
        onBack={() => {
          navigation.goBack()
        }}
      />
      {/* Items */}
      <View style={styles.content}>
        <LinearGradient
          colors={[Colors.backgroundGray, Colors.transparent]}
          style={[styles.gradient, styles.gradientTop]}
          pointerEvents="none"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 20 }}
        >
          {kitDetails?.items.length === 0 ? (
            <Text>No hay artículos en este kit</Text>
          ) : (
            kitDetails?.items.map((item, index) => {
              const BASE_DELAY = 150;
              const STAGGER = 300;
              const calculatedDelay = BASE_DELAY + index * STAGGER;
              return (
                <FadeInItem key={item.itemId} delay={calculatedDelay}>
                <ItemPaymentComponent
                    key={item.itemId}
                  item={item}
                  startDate={kitDetails.startDate}
                  endDate={kitDetails.endDate}
                />
              </FadeInItem>
              );
            })
          )}
        </ScrollView>
        <LinearGradient
          colors={[Colors.transparent, Colors.backgroundGray]}
          style={[styles.gradient, styles.gradientBottom]}
          pointerEvents="none"
        />
      </View>
      
      {/* Footer */}
      <View style={commonStyles.footerContainer}>
        <FadeInItem delay={50}>
          <View style={styles.promoContainer}>
            <Text style={styles.promoLabel}>¿Tienes un código promocional?</Text>

            {!isPromoApplied ? (
              <>
                <View style={styles.promoInputRow}>
                  <TextInput
                    style={[
                      styles.promoInput,
                      promoMessage?.valid === false && styles.promoInputError,
                    ]}
                    value={promoInput}
                    onChangeText={t => { setPromoInput(t.toUpperCase()); setPromoMessage(null); }}
                    placeholder="CÓDIGO"
                    placeholderTextColor="#aaa"
                    autoCapitalize="characters"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={[styles.promoBtn, (!promoInput.trim() || promoLoading) && styles.promoBtnDisabled]}
                    onPress={handleApplyPromo}
                    disabled={!promoInput.trim() || promoLoading}
                  >
                    {promoLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.promoBtnText}>Aplicar</Text>
                    }
                  </TouchableOpacity>
                </View>
                {promoMessage && (
                  <Text style={promoMessage.valid ? styles.promoSuccess : styles.promoError}>
                    {promoMessage.text}
                  </Text>
                )}
              </>
            ) : (
              /* Código aplicado — mostrar con opción de quitar */
              <View style={styles.promoAppliedRow}>
                <View style={styles.promoAppliedBadge}>
                  <Ionicons name="pricetag" size={14} color="#4caf7d" />
                  <Text style={styles.promoAppliedCode}>{appliedPromo}</Text>
                  <Text style={styles.promoAppliedSaving}>
                    -{((kitPrices?.discount ?? 0) / 100).toFixed(2)}€
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRemovePromo} style={styles.promoRemoveBtn} disabled={loading}>
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                  <Text style={styles.promoRemoveText}>Quitar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </FadeInItem>
        {kitPrices !== null && (
          <FadeInItem delay={50}>
            <KitPaymentResumeComponent kitPrices={kitPrices} />
          </FadeInItem>
        )}
        <FadeInItem delay={50}>
          <View style={styles.cardContainer}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
              onChange={(event: { complete: boolean }) => {
                setCardComplete(event.complete);
              }}
            />
          </View>
        </FadeInItem>
        <FadeInItem delay={50}>
          <KeakitButton
            title="Pagar con Stripe"
            onPress={() => handlePayment(false)}
            disabled={isStripePayDisabled}
            variant="blue"
            loading={loading}
          />
        </FadeInItem>
        <FadeInItem delay={50}>
          <KeakitButton
            title="Pagar con mi saldo de KeaKit"
            onPress={() => handlePayment(true)}
            disabled={isWalletPayDisabled}
            variant="green"
            loading={loading}
          />
        </FadeInItem>
        <FadeInItem delay={50}>
          <KeakitButton
            title="Cancelar"
            onPress={() => navigation.navigate("KitDetail", { kitId })}
            disabled={loading}
            variant="violet"
          />
        </FadeInItem>

        <Text style={[commonStyles.caption, styles.testCard]}>
          Tarjeta de prueba: 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123
        </Text>

        <KeakitModal
          visible={errorModalVisible}
          onDismiss={() => setErrorModalVisible(false)}
          message={error ?? "Ha ocurrido un error."}
          variant="error"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  gradientTop: {
    marginTop: 20,
  },
  gradientBottom: {
    marginBottom: 20,
  },
  cardContainer: {
    ...Shadows.small,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: Colors.white,
    width: "100%",
  },
  testCard: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.xs,
  },
  promoContainer: {
    width: '100%', gap: 8,
  },
  promoLabel: {
    fontSize: 13, color: '#595959', fontWeight: '600',
  },
  promoInputRow: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
  },
  promoInput: {
    flex: 1, height: 48, borderWidth: 1.5, borderColor: '#CBD5E1',
    borderRadius: 10, paddingHorizontal: 14, fontSize: 16,
    fontWeight: '700', color: '#2d6e91', backgroundColor: '#f8fbff',
    letterSpacing: 1,
  },
  promoInputValid:  { borderColor: '#10B981', backgroundColor: '#f0fdf4' },
  promoInputError:  { borderColor: '#EF4444', backgroundColor: '#fef2f2' },
  promoBtn: {
    height: 48, paddingHorizontal: 18, borderRadius: 10,
    backgroundColor: '#2d6e91', alignItems: 'center', justifyContent: 'center',
  },
  promoBtnDisabled: { opacity: 0.45 },
  promoBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  promoSuccess: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  promoError:   { fontSize: 13, color: '#EF4444', fontWeight: '600' },
  promoAppliedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f0fdf4', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#10B981',
  },
  promoAppliedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoAppliedCode: { fontSize: 15, fontWeight: '800', color: '#1e526e', letterSpacing: 1 },
  promoAppliedSaving: { fontSize: 14, fontWeight: '700', color: '#4caf7d' },
  promoRemoveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  promoRemoveText: { fontSize: 13, fontWeight: '700', color: '#e74c3c' },
});
