import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigation } from "@react-navigation/native";
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
} from "../../services";

import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, commonStyles, FontSizes, Shadows, Spacing } from "../../styles";
import { LinearGradient } from "expo-linear-gradient";
import {
  Header,
  ItemPaymentComponent,
  KitPaymentResumeComponent,
  KeakitButton,
  KeakitModal,
} from "../../components";

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;
type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route }: Props) {
  const { kitId } = route.params;
  const navigation = useNavigation<CheckoutNav>();
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

  async function fetchKitPrice() {
    try {
      const kitPaymentResponse: KitPaymentDTO = await getKitPayment(
        kitId,
        user?.token ?? "",
      );
      setKitPrices(kitPaymentResponse);
      console.log("Respuesta al obtener el monto del kit:", kitPaymentResponse);
    } catch (error) {
      console.error("Error al obtener el monto del kit:", error);
      showErrorModal(
        "Ha ocurrido un error al obtener el importe del kit.\n" +
          (error as Error).message,
      );
      throw error;
    }
  }

  async function calculateEnoughBalance() {
    await fetchBalance();
    await fetchKitPrice();
    if (kitPrices?.totalPrice !== null && kitPrices?.totalPrice !== undefined) {
      if (kitPrices.totalPrice > 0 && balance * 100 >= kitPrices.totalPrice) {
        setEnoughBalance(true);
      } else {
        setEnoughBalance(false);
        console.log(
          "Saldo insuficiente para pagar con KeaKit. Balance: " +
            balance +
            "€ Monto del kit: " +
            kitPrices?.totalPrice / 100 +
            "€",
        );
      }
    }
  }

  async function fetchKitDetails() {
    try {
      const kitDetailsRes = await getKit(kitId, user?.token ?? "");
      setKitDetails(kitDetailsRes);
      console.log("Detalles del kit:", kitDetailsRes);
    } catch (error) {
      console.error("Error al obtener los detalles del kit:", error);
    }
  }

  // Use effects

  useEffect(() => {
    fetchBalance();
  }, [user?.id, user?.token]);

  useEffect(() => {
    calculateEnoughBalance();
    fetchKitPrice();
    fetchKitDetails();
  }, [kitId]);

  const executeStripePayment = async (kitTotalPrice: number) => {
    console.log("Procesando pago con Stripe...");
    setLoading(true);

    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !cardComplete || !elements || !cardElement) {
      console.error("Stripe o CardElement no están disponibles");
      showErrorModal("Stripe no está disponible en este momento.");
      return;
    }

    try {
      const createPaymentIntentResponse = await createPaymentIntent(
        kitTotalPrice,
        user?.token ?? "",
      );

      const clientSecret = createPaymentIntentResponse.clientSecret;

      const confirmCardPayment = await confirmStripePayment(
        clientSecret,
        cardElement,
        stripe,
      );

      if (confirmCardPayment.error) return;

      console.log(
        "✅ Dinero recibido en Stripe. 🔗 Ver en: https://dashboard.stripe.com/test/payments/" +
          confirmCardPayment.paymentIntent.id,
      );

      await processPaymentWithStripe(
        kitId,
        user?.token ?? "",
        confirmCardPayment.paymentIntent.status,
      );

      console.log("✅ Pago con Stripe procesado exitosamente en el backend.");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error durante el proceso de pago con Stripe:", error);
      showErrorModal(
        "Ha ocurrido un error durante el pago con Stripe.\n" +
          (error as Error).message,
      );
      throw error;
    }
  };

  const handlePayment = async (wallet: boolean) => {
    setLoading(true);
    console.log("Iniciando proceso de pago para kitId:", kitId);

    try {
      await fetchKitPrice();
      if (kitPrices === null || kitPrices.totalPrice === null) {
        throw new Error("No se pudo obtener el monto total del kit.");
      }

      if (wallet) {
        await processPaymentWithWallet(
          kitId,
          user?.token ?? "",
          kitPrices.totalPrice,
        );
        console.log("✅ Pago con wallet procesado exitosamente.");
      } else {
        await executeStripePayment(kitPrices.totalPrice);
      }
      navigation.navigate("MyKits");
    } catch (error) {
      console.error("❌ Error:", error);
      let errorMessage =
        "Ha ocurrido un error durante el proceso de pago.\n" +
        (error as Error).message;
      if ((error as Error).message.includes("payment_intent")) {
        errorMessage +=
          "\n\n¿Eres desarrollador? Este error es conocido.\nRevisa el foro de incidencias de Teams.";
      }
      showErrorModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title="Pagar el kit"
        showBack={true}
        onBack={() => navigation.goBack()}
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
            kitDetails?.items.map((item) => (
              <ItemPaymentComponent
                key={item.itemId}
                item={item}
                startDate={kitDetails.startDate}
                endDate={kitDetails.endDate}
              />
            ))
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
        {kitPrices !== null && (
          <KitPaymentResumeComponent kitPrices={kitPrices} />
        )}

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

        <KeakitButton
          title="Pagar con Stripe"
          onPress={() => handlePayment(false)}
          disabled={isStripePayDisabled}
          variant="blue"
          loading={loading}
        />
        <KeakitButton
          title="Pagar con mi saldo de KeaKit"
          onPress={() => handlePayment(true)}
          disabled={isWalletPayDisabled}
          variant="green"
          loading={loading}
        />
        <KeakitButton
          title="Cancelar"
          onPress={() => navigation.goBack()}
          disabled={loading}
          variant="violet"
        />

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
});
