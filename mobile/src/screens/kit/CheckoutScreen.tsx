import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { API_ROUTES } from "../../config/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { getWalletByUserId } from "../../services/walletService";

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;
type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route }: Props) {
  const { kitId } = route.params;
  const navigation = useNavigation<CheckoutNav>();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState(0);
  const [enoughBalance, setEnoughBalance] = useState(false);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isPaymentIntentError, setIsPaymentIntentError] = useState(false);

  const isStripePayDisabled = !stripe || loading || !cardComplete;
  const isWalletPayDisabled = loading || !enoughBalance;

  const showErrorModal = (message: string) => {
    setError(message);
    setErrorModalVisible(true);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id && user?.token) {
        try {
          const wallet = await getWalletByUserId(user.id, user.token);
          setBalance(wallet.balance);
        } catch (error) {
          console.error("Error al cargar el saldo:", error);
          setBalance(0);
          setEnoughBalance(false);
          showErrorModal("No se pudo cargar el saldo de tu wallet.");
        }
      }
    };

    fetchBalance();
  }, [user?.id, user?.token]);

  useEffect(() => {
    // TODO: Cambiar esta lógica al service
    const fetchAmount = async () => {
      try {
        const response = await fetch(API_ROUTES.GET_KIT_PAYMENT_BY_ID(kitId), {
          method: "GET",
          headers: user?.token
            ? {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
              }
            : undefined,
        });
        console.log("Respuesta al obtener el monto del kit:", response);

        if (!response.ok) {
          console.error("Error al obtener el monto del kit:", response.status);
          showErrorModal("No se pudo obtener el importe del kit.");
          return;
        }

        const data = await response.json();
        setAmount(data.totalPrice);
        if (data.totalPrice > 0 && balance * 100 >= data.totalPrice) {
          setEnoughBalance(true);
        } else {
          console.log(
            "Saldo insuficiente para pagar con KeaKit. Balance:",
            balance,
            "€ Monto del kit:",
            data.totalPrice / 100,
            "€",
          );
          setEnoughBalance(false);
        }
      } catch (error) {
        console.error("Error al obtener el monto del kit:", error);
        showErrorModal("Ha ocurrido un error al obtener el importe del kit.");
      }
    };

    fetchAmount();
  }, [kitId]);

  const handlePayment = async (wallet: boolean) => {
    // TODO: Cambiar esta lógica al service
    setLoading(true);
    console.log("Iniciando proceso de pago para kitId:", kitId);

    try {
      const kitPaymentResponse = await fetch(
        API_ROUTES.GET_KIT_PAYMENT_BY_ID(kitId),
        {
          method: "GET",
          headers: user?.token
            ? {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
              }
            : undefined,
        },
      );

      const kitPaymentData = await kitPaymentResponse.json();

      if (wallet) {
        console.log("Procesando pago con saldo de KeaKit.");
        const walletPaymentResult = await fetch(
          API_ROUTES.PROCESS_PAYMENT_WALLET(kitId),
          {
            method: "POST",
            headers: user?.token
              ? {
                  Authorization: `Bearer ${user.token}`,
                  "Content-Type": "application/json",
                }
              : undefined,
            body: JSON.stringify(kitPaymentData.totalPrice),
          },
        );

        if (!walletPaymentResult.ok) {
          console.error("❌ Error al procesar el pago con saldo en el backend");
          console.log(
            "Respuesta del backend:",
            await walletPaymentResult.text(),
          );
          showErrorModal("No se pudo procesar el pago con saldo de KeaKit.");
          return;
        }
      } else {
        const res = await fetch(API_ROUTES.CREATE_PAYMENT_INTENT, {
          method: "POST",
          headers: user?.token
            ? {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
              }
            : undefined,
          body: JSON.stringify(kitPaymentData.totalPrice),
        });

        const { clientSecret } = await res.json();

        if (!clientSecret) {
          console.error("No se pudo obtener el client secret");
          showErrorModal("No se pudo iniciar el pago con Stripe.");
          return;
        }

        const cardElement = elements?.getElement(CardElement);
        if (!stripe || !cardElement || !elements) {
          console.error("Stripe o CardElement no están disponibles");
          showErrorModal("Stripe no está disponible en este momento.");
          return;
        }

        const result = await stripe?.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (result.error) {
          setIsPaymentIntentError(true);
          console.error("❌ Error al procesar el pago con Stripe:", result.error?.message);
          showErrorModal("No se pudo procesar el pago con Stripe: " + result.error?.message);
          return;
        } else {
          console.log(
            "✅ Dinero recibido en Stripe. 🔗 Ver en: https://dashboard.stripe.com/test/payments/" +
              result.paymentIntent.id,
          );

          const paymentResult = await fetch(
            API_ROUTES.PROCESS_PAYMENT_STRIPE(kitId),
            {
              method: "POST",
              headers: user?.token
                ? {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                  }
                : undefined,
              body: JSON.stringify(result.paymentIntent.status),
            },
          );

          if (!paymentResult.ok) {
            console.error("❌ Error al procesar el pago en el backend");
            console.log("Respuesta del backend:", await paymentResult.text());
            showErrorModal("El pago se realizó, pero no se pudo confirmar en el backend.");
            return;
          }
        }
      }
      navigation.navigate("MyKits");
    } catch (error) {
      console.error("❌ Error:", error);
      showErrorModal("Ha ocurrido un error inesperado durante el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // TODO: Mejorar estética
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Checkout
      </Text>

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
          style={[styles.button, isWalletPayDisabled && styles.buttonDisabled]}
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
        style={[styles.outlinedButton, loading && styles.outlinedButtonDisabled]}
        contentStyle={styles.buttonContent}
        textColor={loading ? "#9CA3AF" : "#1A3A52"}
        labelStyle={[styles.secondaryButtonLabel, loading && styles.secondaryButtonLabelDisabled]}
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
          <Text style={styles.errorModalMessage}>{error ?? "Ha ocurrido un error."}</Text>
          {isPaymentIntentError && (
            <Text style={styles.errorModalMessage}>
              ¿Eres desarrollador? Revisa este{" "}
            <Text
              style={styles.errorModalLink}
              onPress={() => Linking.openURL("https://teams.microsoft.com/l/message/19:b67b2f676f2441bfb3a2aa815b23d9f8@thread.tacv2/1773437428081?tenantId=ef4a684e-81b5-491c-a98e-c7b31be6c469&groupId=f0cbe5b1-fa30-4983-8517-30fe68999067&parentMessageId=1773437428081&teamName=ISPP&channelName=Incidencias&createdTime=1773437428081")}
            >
              post de Teams
            </Text>.</Text>
          )}
          <Button
            mode="contained"
            onPress={() => {
              setErrorModalVisible(false)
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F7FB",
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#1A3A52",
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
