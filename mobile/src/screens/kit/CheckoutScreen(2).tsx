import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

export default function CheckoutScreen() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useStripe();

  // 1️⃣ Pedimos al backend el clientSecret
  useEffect(() => {
    fetch('http://localhost:8080/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }) // monto en centavos
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
      .catch(err => console.error(err));
  }, []);

  const handlePay = async () => {
    if (!clientSecret) return;
    setLoading(true);

    const { error, paymentIntent } = await confirmPayment(clientSecret, {
    paymentMethodType: 'Card',
    paymentMethodData: {
        billingDetails: { name: 'Cliente Demo' },
    },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (paymentIntent) {
      Alert.alert('Éxito', `Pago confirmado: ${paymentIntent.status}`);
    }
  };

  if (!clientSecret) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text>Cargando pago...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
        <CardField
        postalCodeEnabled={false}
        style={{ height: 50, marginVertical: 30 }}
        placeholders={{
            number: '1234 1234 1234 1234'
        }}
        />
      <Button title={loading ? 'Procesando...' : 'Pagar $10'} onPress={handlePay} disabled={loading} />
    </View>
  );
}
