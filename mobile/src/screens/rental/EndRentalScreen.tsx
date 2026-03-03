import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  ArticleReviewDetail,
  ReturnResponse,
} from '../../types';
import { Colors, Spacing, commonStyles } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { processArticleReturn, getArticleReviewDetail } from '../../services/rentalService';

type EndRentalRouteProp = RouteProp<RootStackParamList, 'EndRental'>;
type EndRentalNavProp = NativeStackNavigationProp<RootStackParamList, 'EndRental'>;

const DEPOSIT_PERCENTAGE = 0.20;

const EndRentalScreen: React.FC = () => {
  const route = useRoute<EndRentalRouteProp>();
  const navigation = useNavigation<EndRentalNavProp>();
  const { user } = useAuth();

  const articleId = route.params?.articleId;

  const [article, setArticle] = useState<ArticleReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [confirmGoodVisible, setConfirmGoodVisible] = useState(false);
  const [damageModalVisible, setDamageModalVisible] = useState(false);
  const [damageComments, setDamageComments] = useState('');
  const [damageError, setDamageError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [result, setResult] = useState<ReturnResponse | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!user || !articleId) return;
      try {
        setLoading(true);
        const data = await getArticleReviewDetail(articleId, user.token);
        setArticle(data);
      } catch {
        setErrorMessage('No se pudo cargar el artículo.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId, user]);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getDepositAmount = (): number => {
    if (!article) return 0;
    return article.pricePerMonth * DEPOSIT_PERCENTAGE;
  };

  // HU-ARRENDADOR-33: Confirmar buen estado → devolver garantía
  const handleMarkGood = () => {
    setConfirmGoodVisible(true);
  };

  const confirmGood = async () => {
    setConfirmGoodVisible(false);
    await processReturn('GOOD', '');
  };

  // HU-ARRENDADOR-34: Indicar daños → retener garantía
  const handleMarkDamaged = () => {
    setDamageComments('');
    setDamageError('');
    setDamageModalVisible(true);
  };

  const confirmDamage = async () => {
    if (!damageComments.trim()) {
      setDamageError('Por favor, describe los daños encontrados.');
      return;
    }
    setDamageError('');
    setDamageModalVisible(false);
    await processReturn('DAMAGED', damageComments);
  };

  const processReturn = async (condition: 'GOOD' | 'DAMAGED', comments: string) => {
    if (!user || !article) return;
    setProcessing(true);

    try {
      const returnResult = await processArticleReturn(
        article.id,
        user.id,
        user.token,
        { condition, comments: comments || undefined },
      );
      setResult(returnResult);
      setSuccessModalVisible(true);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'No se pudo procesar la devolución.',
      });
    } finally {
      setProcessing(false);
    }
  };

  /* ── Loading / Error states ── */

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando artículo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!article || errorMessage) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={[styles.loadingText, { color: '#FF3B30' }]}>
            {errorMessage || 'No se pudo cargar el artículo.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const depositAmount = getDepositAmount();

  /* ── Render ── */

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisión de Artículo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Notification banner */}
      {notification && (
        <View
          style={[
            styles.notificationBanner,
            notification.type === 'success'
              ? styles.notificationSuccess
              : styles.notificationError,
          ]}
        >
          <Ionicons
            name={notification.type === 'success' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color="#fff"
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
          <TouchableOpacity onPress={() => setNotification(null)}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {processing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Procesando devolución...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Article info card */}
          <View style={styles.articleInfoCard}>
            <View style={styles.articleIconCircle}>
              <Ionicons name="cube-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.articleName}>{article.title}</Text>
            <Text style={styles.articleSubtitle}>{article.pricePerMonth.toFixed(2)}€/mes</Text>

            {/* Tenant info */}
            {article.tenantName && (
              <View style={styles.tenantCard}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantLabel}>Arrendatario</Text>
                  <Text style={styles.tenantName}>{article.tenantName}</Text>
                  {article.tenantEmail && (
                    <Text style={styles.tenantEmail}>{article.tenantEmail}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Deposit info */}
            <View style={styles.depositCard}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <View style={styles.depositInfo}>
                <Text style={styles.depositLabel}>Garantía (20%)</Text>
                <Text style={styles.depositValue}>{depositAmount.toFixed(2)}€</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
            <Text style={styles.instructionsText}>
              Revisa el artículo devuelto e indica su estado. Si está en buen estado, la
              garantía se devolverá al arrendatario. Si presenta daños, se retendrá.
            </Text>
          </View>

          {/* Action buttons */}
          <Text style={styles.sectionTitle}>¿En qué estado se encuentra?</Text>

          <TouchableOpacity style={styles.goodButton} onPress={handleMarkGood}>
            <View style={styles.actionButtonContent}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
              </View>
              <View style={styles.actionTextContent}>
                <Text style={styles.goodButtonTitle}>Buen estado</Text>
                <Text style={styles.actionDescription}>
                  Se devuelve la garantía de {depositAmount.toFixed(2)}€ al arrendatario
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.success} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.damagedButton} onPress={handleMarkDamaged}>
            <View style={styles.actionButtonContent}>
              <View style={styles.actionIconCircle}>
                <Ionicons name="alert-circle" size={28} color="#FF9800" />
              </View>
              <View style={styles.actionTextContent}>
                <Text style={styles.damagedButtonTitle}>Con daños</Text>
                <Text style={styles.actionDescription}>
                  Se retiene la garantía de {depositAmount.toFixed(2)}€
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF9800" />
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Confirm good condition modal */}
      <Modal visible={confirmGoodVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
              <Text style={styles.modalTitle}>Confirmar buen estado</Text>
            </View>

            <Text style={styles.modalSubtitle}>Artículo: {article.title}</Text>
            <Text style={styles.modalDescription}>
              ¿Confirmas que este artículo ha sido devuelto en buen estado?{'\n\n'}
              Se devolverá {depositAmount.toFixed(2)}€ (20% de garantía) al arrendatario.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setConfirmGoodVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: Colors.success }]}
                onPress={confirmGood}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.modalConfirmText}>Sí, en buen estado</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Damage description modal */}
      <Modal visible={damageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={28} color="#FF9800" />
              <Text style={styles.modalTitle}>Reportar Daños</Text>
            </View>

            <Text style={styles.modalSubtitle}>Artículo: {article.title}</Text>
            <Text style={styles.modalDescription}>
              Describe los daños encontrados en el artículo. La garantía (
              {depositAmount.toFixed(2)}€) será retenida.
            </Text>

            <TextInput
              style={[styles.damageInput, damageError ? { borderColor: '#FF3B30' } : {}]}
              placeholder="Describe los daños encontrados..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={damageComments}
              onChangeText={(text) => {
                setDamageComments(text);
                if (damageError) setDamageError('');
              }}
              textAlignVertical="top"
            />
            {damageError ? (
              <Text style={styles.damageErrorText}>{damageError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setDamageModalVisible(false);
                  setDamageComments('');
                  setDamageError('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmDamage}>
                <Ionicons name="alert-circle" size={18} color="#fff" />
                <Text style={styles.modalConfirmText}>Confirmar daños</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { alignItems: 'center' }]}>
            <View style={styles.successIconCircle}>
              <Ionicons
                name={result?.resolution === 'DEPOSIT_RETURNED' ? 'checkmark-done' : 'alert-circle'}
                size={48}
                color={result?.resolution === 'DEPOSIT_RETURNED' ? Colors.success : '#FF9800'}
              />
            </View>
            <Text style={[styles.modalTitle, { textAlign: 'center', marginTop: 16 }]}>
              {result?.resolution === 'DEPOSIT_RETURNED'
                ? '¡Revisión completada!'
                : 'Daños registrados'}
            </Text>
            <Text style={[styles.modalDescription, { textAlign: 'center', marginTop: 8 }]}>
              {result?.message}
            </Text>

            {result && (
              <View style={styles.resultSummary}>
                <Text style={styles.resultLabel}>
                  {result.resolution === 'DEPOSIT_RETURNED' ? 'Garantía devuelta' : 'Garantía retenida'}
                </Text>
                <Text
                  style={[
                    styles.resultAmount,
                    { color: result.resolution === 'DEPOSIT_RETURNED' ? Colors.success : '#FF9800' },
                  ]}
                >
                  {result.amountProcessed.toFixed(2)}€
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.acceptButton, { marginTop: 20, width: '100%' }]}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ── Styles ── */

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: { marginTop: Spacing.md, fontSize: 16, color: '#666', fontWeight: '500' },
  backButton: { padding: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  scrollContent: { padding: 20 },

  /* Article info card */
  articleInfoCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  articleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleName: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  articleSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  /* Tenant info */
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    width: '100%',
    gap: 10,
  },
  tenantInfo: { flex: 1 },
  tenantLabel: { fontSize: 12, color: Colors.textSecondary },
  tenantName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  tenantEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },

  /* Deposit info */
  depositCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    width: '100%',
    gap: 10,
  },
  depositInfo: { flex: 1 },
  depositLabel: { fontSize: 13, color: Colors.textSecondary },
  depositValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginTop: 2 },

  /* Instructions */
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  instructionsText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },

  /* Section */
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },

  /* Action buttons */
  goodButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.success,
  },
  damagedButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FF9800',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContent: { flex: 1 },
  goodButtonTitle: { fontSize: 16, fontWeight: '700', color: Colors.success },
  damagedButtonTitle: { fontSize: 16, fontWeight: '700', color: '#FF9800' },
  actionDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  modalSubtitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  damageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    color: Colors.textPrimary,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
  },
  modalCancelText: { color: '#666', fontWeight: '600', fontSize: 15 },
  modalConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  /* Notification banner */
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    gap: 8,
  },
  notificationSuccess: { backgroundColor: '#4CAF50' },
  notificationError: { backgroundColor: '#FF3B30' },
  notificationText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '500' },

  /* Error/retry */
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  /* Damage error text */
  damageErrorText: { color: '#FF3B30', fontSize: 13, marginTop: 6 },

  /* Success modal */
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultSummary: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    width: '100%',
  },
  resultLabel: { fontSize: 14, color: Colors.textSecondary },
  resultAmount: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  acceptButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});

export default EndRentalScreen;
