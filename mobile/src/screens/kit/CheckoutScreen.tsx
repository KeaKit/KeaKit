import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking, ScrollView } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { KitPaymentDTO, KitResponse, RootStackParamList } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { getLoggedUserWallet } from "../../services/walletService";
import { getKitPayment, getKit } from "../../services/kitService";
import {
  processPaymentWithWallet,
  createPaymentIntent,
  confirmStripePayment,
  processPaymentWithStripe,
} from "../../services/paymentService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/Header";
import { ItemPaymentComponent } from "../../components/ItemPaymentComponent";
import { Colors, Spacing } from "../../styles";
import { LinearGradient } from "expo-linear-gradient";

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
  const [isPaymentIntentError, setIsPaymentIntentError] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [kitDetails, setKitDetails] = useState<KitResponse>();

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

  async function fetchKitTotalPrice() {
    try {
      const kitPaymentResponse: KitPaymentDTO = await getKitPayment(
        kitId,
        user?.token ?? "",
      );
      console.log("Respuesta al obtener el monto del kit:", kitPaymentResponse);
      setTotalPrice(kitPaymentResponse.totalPrice);
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
    await fetchKitTotalPrice();
    if (totalPrice !== null && totalPrice !== undefined) {
      if (totalPrice > 0 && balance * 100 >= totalPrice) {
        setEnoughBalance(true);
      } else {
        setEnoughBalance(false);
        console.log(
          "Saldo insuficiente para pagar con KeaKit. Balance: " +
            balance +
            "€ Monto del kit: " +
            totalPrice / 100 +
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
    fetchKitDetails();
  }, [kitId]);

  const executeStripePayment = async (kitTotalPrice: number) => {
    console.log("Procesando pago con Stripe...");
    console.log("loading:", loading);

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
    } catch (error) {
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
      await fetchKitTotalPrice();
      if (totalPrice === null) {
        throw new Error("No se pudo obtener el monto total del kit.");
      }

      if (wallet) {
        await processPaymentWithWallet(kitId, user?.token ?? "", totalPrice);
        console.log("✅ Pago con wallet procesado exitosamente.");
      } else {
        await executeStripePayment(totalPrice);
      }
      navigation.navigate("MyKits");
    } catch (error) {
      console.error("❌ Error:", error);
      showErrorModal(
        "Ha ocurrido un error inesperado durante el pago." +
          (error as Error).message,
      );
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
          style={styles.gradientTop}
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
          style={styles.gradientBottom}
          pointerEvents="none"
        />
      </View>
      {/* Footer */}
      <View style={styles.footerContainer}>
        {/* TODO: Resumen del pago */}
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

        <Button
          mode="contained"
          onPress={() => handlePayment(false)}
          disabled={isStripePayDisabled}
          loading={loading}
          style={[styles.button, isStripePayDisabled && styles.buttonDisabled]}
          contentStyle={styles.buttonContent}
          buttonColor={isStripePayDisabled ? "#C7D0DB" : "#1A3A52"}
          textColor={isStripePayDisabled ? "#6B7280" : "#FFFFFF"}
          labelStyle={[
            styles.primaryButtonLabel,
            isStripePayDisabled && styles.primaryButtonLabelDisabled,
          ]}
        >
          Pagar con Stripe
        </Button>
        {enoughBalance && (
          <Button
            mode="contained"
            onPress={() => handlePayment(true)}
            disabled={isWalletPayDisabled}
            loading={loading}
            style={[
              styles.button,
              isWalletPayDisabled && styles.buttonDisabled,
            ]}
            contentStyle={styles.buttonContent}
            buttonColor={isWalletPayDisabled ? "#C7D0DB" : "#0F766E"}
            textColor={isWalletPayDisabled ? "#6B7280" : "#FFFFFF"}
            labelStyle={[
              styles.primaryButtonLabel,
              isWalletPayDisabled && styles.primaryButtonLabelDisabled,
            ]}
          >
            Pagar con mi saldo de KeaKit
          </Button>
        )}
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={[
            styles.outlinedButton,
            loading && styles.outlinedButtonDisabled,
          ]}
          contentStyle={styles.buttonContent}
          textColor={loading ? "#9CA3AF" : "#1A3A52"}
          labelStyle={[
            styles.secondaryButtonLabel,
            loading && styles.secondaryButtonLabelDisabled,
          ]}
        >
          Cancelar
        </Button>

        <Text variant="bodySmall" style={styles.testCard}>
          Tarjeta de prueba: 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123
        </Text>

        <Portal>
          <Modal
            visible={errorModalVisible}
            onDismiss={() => setErrorModalVisible(false)}
            contentContainerStyle={styles.errorModalContainer}
          >
            <Text variant="titleMedium" style={styles.errorModalTitle}>
              Error en el pago
            </Text>
            <Text style={styles.errorModalMessage}>
              {error ?? "Ha ocurrido un error."}
            </Text>
            {isPaymentIntentError && (
              <Text style={styles.errorModalMessage}>
                ¿Eres desarrollador? Revisa este{" "}
                <Text
                  style={styles.errorModalLink}
                  onPress={() =>
                    Linking.openURL(
                      "https://teams.microsoft.com/l/message/19:b67b2f676f2441bfb3a2aa815b23d9f8@thread.tacv2/1773437428081?tenantId=ef4a684e-81b5-491c-a98e-c7b31be6c469&groupId=f0cbe5b1-fa30-4983-8517-30fe68999067&parentMessageId=1773437428081&teamName=ISPP&channelName=Incidencias&createdTime=1773437428081",
                    )
                  }
                >
                  post de Teams
                </Text>
                .
              </Text>
            )}
            <Button
              mode="contained"
              onPress={() => {
                setErrorModalVisible(false);
                setIsPaymentIntentError(false);
              }}
              style={styles.errorModalButton}
              buttonColor="#1A3A52"
              textColor="#FFFFFF"
            >
              Entendido
            </Button>
          </Modal>
        </Portal>
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
  footerContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    padding: 50,
    paddingTop: 30,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    marginTop: 20,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    marginBottom: 20,
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#1A3A52",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#C7D0DB",
    opacity: 1,
  },
  outlinedButton: {
    marginTop: 10,
    borderRadius: 8,
    borderColor: "#1A3A52",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  outlinedButtonDisabled: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
  },
  buttonContent: {
    paddingVertical: 8,
    minHeight: 44,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  primaryButtonLabelDisabled: {
    color: "#6B7280",
  },
  secondaryButtonLabel: {
    color: "#1A3A52",
    fontWeight: "700",
  },
  secondaryButtonLabelDisabled: {
    color: "#9CA3AF",
  },
  testCard: {
    marginTop: 12,
    textAlign: "center",
    color: "#374151",
  },
  errorModalContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorModalTitle: {
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  errorModalMessage: {
    color: "#1F2937",
    marginBottom: 10,
    lineHeight: 20,
  },
  errorModalLink: {
    color: "#1D4ED8",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginBottom: 16,
  },
  errorModalButton: {
    alignSelf: "flex-end",
  },
});
