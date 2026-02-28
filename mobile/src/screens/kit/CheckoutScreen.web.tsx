import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { useAuth } from '../../context/AuthContext';
import { createPaymentIntent } from '../../services/paymentService';
import { createKit } from '../../services/kitService';
import { RootStackParamList, CreatePaymentIntentResponse } from '../../types';
import { commonStyles } from '../../styles';
import { checkoutStyles } from '../../styles/checkoutStyles';

type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutNav = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutWebInner: React.FC = () => {
  const route = useRoute<CheckoutRoute>();
  const navigation = useNavigation<CheckoutNav>();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const { baseAmount, draftKit, kitId } = route.params;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<CreatePaymentIntentResponse | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const loadIntent = useCallback(async () => {
    if (!user?.token) {
      Alert.alert('Error', 'Necesitas iniciar sesión.');
      setLoadingIntent(false);
      return;
    }

    try {
      setLoadingIntent(true);
      const data = await createPaymentIntent({ baseAmount, kitId }, user.token);
      setPaymentData(data);
      setClientSecret(data.clientSecret);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al iniciar pago';
      Alert.alert('Error', msg);
    } finally {
      setLoadingIntent(false);
    }
  }, [baseAmount, kitId, user?.token]);

  useEffect(() => {
    loadIntent();
  }, [loadIntent]);

  const cardStyle = useMemo(
    () => ({
      style: {
        base: {
          color: '#1A3A52',
          fontSize: '16px',
          '::placeholder': { color: '#9CA3AF' },
        },
        invalid: { color: '#ff4d4f' },
      },
    }),
    [],
  );

  const handlePay = async () => {
    if (paying || paid) return;
    if (!stripe || !elements || !clientSecret || !user?.token) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      Alert.alert('Error', 'No se pudo inicializar la tarjeta.');
      return;
    }

    try {
      setPaying(true);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: { name: user?.name ?? 'Cliente' },
        },
      });

      if (result.error) {
        console.error('Stripe confirm error:', result.error);

        if (result.error.code === 'payment_intent_unexpected_state') {
          Alert.alert(
            'Intento de pago no válido',
            'Se generará un nuevo intento de pago. Pulsa "Pagar ahora" otra vez.'
          );
          await loadIntent();
          return;
        }

        Alert.alert('Error de pago', `${result.error.message ?? 'Error desconocido'}`);
        return;
      }

      if (!result.paymentIntent) {
        Alert.alert('Error', 'No se recibió respuesta del pago.');
        return;
      }

      if (result.paymentIntent.status !== 'succeeded') {
        Alert.alert('Pago no completado', `Estado: ${result.paymentIntent.status}`);
        return;
      }

      await createKit(draftKit, user.token);

      setPaid(true);
      setClientSecret(null);

      Alert.alert('Éxito', 'Pago confirmado y kit creado correctamente.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al finalizar la compra';
      Alert.alert('Error', msg);
    } finally {
      setPaying(false);
    }
  };

  if (loadingIntent) {
    return (
      <View style={checkoutStyles.center}>
        <Text style={checkoutStyles.loadingText}>Preparando pago...</Text>
      </View>
    );
  }

  if (!paymentData) {
    return (
      <View style={checkoutStyles.center}>
        <Text>No se pudo cargar la información del pago.</Text>
        <TouchableOpacity style={commonStyles.primaryButton} onPress={loadIntent}>
          <Text style={commonStyles.primaryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={checkoutStyles.container}>
      <Text style={checkoutStyles.title}>Checkout</Text>

      <View style={checkoutStyles.summaryCard}>
        <View style={checkoutStyles.row}>
          <Text>Subtotal</Text>
          <Text>€{(paymentData.baseAmount / 100).toFixed(2)}</Text>
        </View>

        <View style={checkoutStyles.row}>
          <Text>Depósito ({Math.round(paymentData.depositRate * 100)}%)</Text>
          <Text>€{(paymentData.depositAmount / 100).toFixed(2)}</Text>
        </View>

        <View style={checkoutStyles.row}>
          <Text style={checkoutStyles.totalLabel}>Total</Text>
          <Text style={checkoutStyles.totalValue}>€{(paymentData.totalAmount / 100).toFixed(2)}</Text>
        </View>
      </View>

      <View
        style={{
          marginVertical: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#E8ECF1',
          borderRadius: 10,
          backgroundColor: '#fff',
        }}
      >
        <CardElement options={cardStyle} />
      </View>

      <TouchableOpacity
        style={[commonStyles.primaryButton, (paying || paid) && { opacity: 0.7 }]}
        onPress={handlePay}
        disabled={paying || paid || !stripe || !clientSecret}
      >
        <Text style={commonStyles.primaryButtonText}>
          {paid ? 'Pagado' : paying ? 'Procesando...' : 'Pagar ahora'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const CheckoutScreenWeb: React.FC = () => {
  const publishableKey =
    (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!publishableKey) {
    return (
      <View style={checkoutStyles.center}>
        <Text>Falta EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY en mobile/.env</Text>
      </View>
    );
  }

  if (!stripePromise) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutWebInner />
    </Elements>
  );
};

export default CheckoutScreenWeb;
