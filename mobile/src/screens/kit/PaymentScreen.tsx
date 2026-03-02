import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import { CardField, useStripe } from '@stripe/stripe-react-native';

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { confirmPayment } = useStripe();

  const kitId = route.params?.kitId;
  const kitName = route.params?.kitName;
  const amount = route.params?.amount;
  const tenantId = route.params?.tenantId;

  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string>('');

  useEffect(() => {
    // Obtener el saldo del usuario y crear Payment Intent
    if (user?.id) {
      fetchUserBalance();
      createPaymentIntent();
    }
  }, [user]);

  const fetchUserBalance = async () => {
    try {
      if (!user?.id) return;
      const response = await paymentService.getUserBalance(user.id);
      setBalance(response.availableBalance);
    } catch (error) {
      console.error('Error obteniendo saldo:', error);
    }
  };

  const createPaymentIntent = async () => {
    try {
      if (!kitId || !tenantId) return;
      setLoading(true);

      const response = await paymentService.createPaymentIntent(kitId, tenantId);
      setPaymentIntentClientSecret(response.clientSecret);
    } catch (error: any) {
      Alert.alert('Error', 'Error creando el intento de pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Error', 'Por favor completa los datos de la tarjeta');
      return;
    }

    if (!paymentIntentClientSecret) {
      Alert.alert('Error', 'No se pudo inicializar el pago. Intenta de nuevo.');
      return;
    }

    try {
      setProcessingPayment(true);

      // Confirmar el pago con Stripe
      const { paymentIntent, error } = await confirmPayment(paymentIntentClientSecret, {
        type: 'Card',
        billingDetails: {
          email: user?.email,
          name: user?.name,
        },
      });

      if (error) {
        Alert.alert('Error de pago', error.message || 'No se pudo procesar el pago');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'Succeeded') {
        // Confirmar el pago en el backend
        const confirmResponse = await paymentService.confirmPayment(
          kitId,
          tenantId,
          paymentIntent.id
        );

        if (confirmResponse.success) {
          Alert.alert(
            '¡Pago Exitoso!',
            `El kit "${kitName}" ha sido pagado correctamente.\n\nMonto: €${amount?.toFixed(2)}\n\nComisión plataforma: €${confirmResponse.platformFee?.toFixed(2)}`
          );
          navigation.goBack();
        } else {
          Alert.alert('Error', confirmResponse.message || 'Error confirmando el pago');
        }
      } else {
        Alert.alert('Error', 'El pago no se completó correctamente');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar Kit con Stripe</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumen del pago */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="cube-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.kitName}>{kitName || 'Kit'}</Text>
          <Text style={styles.amountLabel}>Monto a pagar</Text>
          <Text style={styles.amount}>€{amount?.toFixed(2) || '0.00'}</Text>
        </View>

        {/* Formulario de tarjeta */}
        {paymentIntentClientSecret && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Datos de Tarjeta</Text>
            <View style={styles.cardFieldContainer}>
              <CardField
                onCardChange={(cardDetails) => setCardDetails(cardDetails)}
                style={styles.cardField}
                autofocus={true}
              />
            </View>
          </View>
        )}

        {/* Información sobre el pago */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Seguridad del Pago</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoTitle}>Encriptado Stripe</Text>
                <Text style={styles.infoText}>
                  Tu tarjeta se procesa de forma segura a través de Stripe.
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoTitle}>Dinero Directo</Text>
                <Text style={styles.infoText}>
                  El pago va directamente a la cuenta Stripe Connect del propietario.
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="percent" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoTitle}>Comisión 10%</Text>
                <Text style={styles.infoText}>
                  KeaKit cobra 10% de comisión por facilitar la transacción.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de pago */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (processingPayment || !cardDetails?.complete || !paymentIntentClientSecret) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={processingPayment || !cardDetails?.complete || !paymentIntentClientSecret}
        >
          {processingPayment ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFF" />
              <Text style={styles.payButtonText}>Confirmar Pago</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={processingPayment}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kitName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cardSection: {
    marginBottom: Spacing.lg,
  },
  cardFieldContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardField: {
    height: 50,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentScreen;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar Kit</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumen del pago */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="cube-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.kitName}>{kitName || 'Kit'}</Text>
          <Text style={styles.amountLabel}>Monto a pagar</Text>
          <Text style={styles.amount}>€{amount?.toFixed(2) || '0.00'}</Text>
        </View>

        {/* Balance actual */}
        <View style={styles.balanceSection}>
          <Text style={styles.sectionTitle}>Tu Saldo</Text>
          {balance !== null ? (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo disponible</Text>
              <Text style={styles.balanceAmount}>€{balance.toFixed(2)}</Text>
            </View>
          ) : (
            <ActivityIndicator color={Colors.primary} size="large" />
          )}

          {balance !== null && balance < (amount || 0) && (
            <View style={styles.insufficientWarning}>
              <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.warningTitle}>Saldo Insuficiente</Text>
                <Text style={styles.warningText}>
                  Necesitas €{((amount || 0) - balance).toFixed(2)} más para completar el pago.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Información sobre el pago */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Sobre este Pago</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>Pago Seguro</Text>
                <Text style={styles.infoText}>
                  Tu dinero se transfiere de forma segura al propietario del kit.
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>Transferencia Directa</Text>
                <Text style={styles.infoText}>
                  El dinero va directamente a la cuenta del propietario.
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoTitle}>Confirmación</Text>
                <Text style={styles.infoText}>
                  Recibirás un comprobante del pago inmediatamente.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de pago */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || (balance !== null && balance < (amount || 0))) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={loading || (balance !== null && balance < (amount || 0))}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFF" />
              <Text style={styles.payButtonText}>Confirmar Pago</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kitName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  balanceSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  insufficientWarning: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  infoItem_last: {
    marginBottom: 0,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PaymentScreen;
