import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Dialog, Portal, Provider } from 'react-native-paper';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { API_ROUTES } from '../../config/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../types";
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type CheckoutNav = NativeStackNavigationProp<RootStackParamList, "MyKits">;
type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ route }: Props) {
  const { kitId } = route.params;
  const navigation = useNavigation<CheckoutNav>();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    console.log("Iniciando proceso de pago para kitId:", kitId);

    try {

      const kitPaymentResponse = await fetch(API_ROUTES.GET_KIT_PAYMENT_BY_ID(kitId), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const kitPaymentData = await kitPaymentResponse.json();

      const res = await fetch(API_ROUTES.CREATE_PAYMENT_INTENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kitPaymentData.totalPrice)
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
        }
      });

      if (result.error) {
        console.error('❌ Error en el pago:', result.error?.message);
      }  else {
        console.log('✅ Dinero recibido en Stripe. 🔗 Ver en: https://dashboard.stripe.com/test/payments/' + result.paymentIntent.id);
        
        const paymentResult = await fetch(API_ROUTES.PROCESS_PAYMENT_STRIPE(kitId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.paymentIntent.status)
        });

        if (!paymentResult.ok) {
          console.error('❌ Error al procesar el pago en el backend');
          console.log('Respuesta del backend:', await paymentResult.text());
          return;
        }
        
        navigation.navigate("MyKits");
      }
    } catch (error) {
      console.error('❌ Error:', error);
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
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
          onChange={(event) => {
            setCardComplete(event.complete);
          }}
        />
      </View>

      <Button
        mode="contained"
        onPress={handlePayment}
        disabled={!stripe || loading || !cardComplete}
        loading={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Pagar 10€
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
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  cardContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
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
    textAlign: 'center',
    color: '#666',
  },
});