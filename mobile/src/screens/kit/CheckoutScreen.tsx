import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
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
          return;
        }

        const cardElement = elements?.getElement(CardElement);
        if (!stripe || !cardElement || !elements) {
          console.error("Stripe o CardElement no están disponibles");
          return;
        }

        const result = await stripe?.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (result.error) {
          console.error("❌ Error en el pago:", result.error?.message);
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
            return;
          }
        }
      }
      navigation.navigate("MyKits");
    } catch (error) {
      console.error("❌ Error:", error);
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
        disabled={!stripe || loading || !cardComplete}
        loading={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Pagar con Stripe
      </Button>
      {enoughBalance && (
        <Button
          mode="contained"
          onPress={() => handlePayment(true)}
          disabled={loading || !enoughBalance}
          loading={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Pagar con mi saldo de KeaKit
        </Button>
      )}
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Cancelar
      </Button>

      <Text variant="bodySmall" style={styles.testCard}>
        Tarjeta de prueba: 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  testCard: {
    marginTop: 12,
    textAlign: "center",
    color: "#666",
  },
});
