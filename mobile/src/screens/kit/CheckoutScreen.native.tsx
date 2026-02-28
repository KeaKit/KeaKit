import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import { createPaymentIntent } from '../../services/paymentService';
import { createKit } from '../../services/kitService';
import { RootStackParamList, CreatePaymentIntentResponse } from '../../types';
import { commonStyles } from '../../styles';
import { checkoutStyles } from '../../styles/checkoutStyles';

type CheckoutRoute = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutNav = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const route = useRoute<CheckoutRoute>();
  const navigation = useNavigation<CheckoutNav>();
  const { user } = useAuth();
  const { confirmPayment } = useStripe();

  const { baseAmount, draftKit, kitId } = route.params;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<CreatePaymentIntentResponse | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const loadIntent = async () => {
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
    };

    loadIntent();
  }, [baseAmount, kitId, user?.token]);

  const handlePay = async () => {
    if (!clientSecret || !user?.token) return;

    try {
      setPaying(true);

      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: { name: user?.name ?? 'Cliente' },
        },
      });

      if (error) {
        Alert.alert('Error de pago', error.message);
        return;
      }

      if (!paymentIntent) {
        Alert.alert('Error', 'No se recibió respuesta del pago.');
        return;
      }

      await createKit(draftKit, user.token);

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
        <ActivityIndicator size="large" />
        <Text style={checkoutStyles.loadingText}>Preparando pago...</Text>
      </View>
    );
  }

  if (!paymentData) {
    return (
      <View style={checkoutStyles.center}>
        <Text>No se pudo cargar la información del pago.</Text>
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
          <Text style={checkoutStyles.totalValue}>
            €{(paymentData.totalAmount / 100).toFixed(2)}
          </Text>
        </View>
      </View>

      <CardField
        postalCodeEnabled={false}
        style={checkoutStyles.cardField}
        placeholders={{ number: '4242 4242 4242 4242' }}
      />

      <TouchableOpacity
        style={[commonStyles.primaryButton, paying && { opacity: 0.7 }]}
        onPress={handlePay}
        disabled={paying}
      >
        <Text style={commonStyles.primaryButtonText}>
          {paying ? 'Procesando...' : 'Pagar ahora'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutScreen;
