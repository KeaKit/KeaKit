import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RootStackParamList,
  IncidentResponse,
  IncidentCommentResponse,
  IncidentStatus,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  getIncidentById,
  getIncidentComments,
  addIncidentComment,
  deleteIncident,
  resolveIncident,
} from '../../services/incidentService';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';

type DetailNav = NativeStackNavigationProp<RootStackParamList, 'IncidentDetail'>;
type DetailRoute = RouteProp<RootStackParamList, 'IncidentDetail'>;

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  OPEN: { label: 'Abierta', color: Colors.warning, icon: 'alert-circle' },
  IN_PROGRESS: { label: 'En progreso', color: Colors.info, icon: 'time' },
  RESOLVED: { label: 'Resuelta', color: Colors.success, icon: 'checkmark-circle' },
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: 'General',
  DAMAGED_ITEM: 'Objeto dañado',
};

const IncidentDetailScreen: React.FC = () => {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { incidentId, isReceived } = route.params;
  const { user } = useAuth();

  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [comments, setComments] = useState<IncidentCommentResponse[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const commentInputRef = useRef<TextInput>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [inc, cmts] = await Promise.all([
        getIncidentById(incidentId, user.token),
        getIncidentComments(incidentId, user.token),
      ]);
      setIncident(inc);
      setComments(cmts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la incidencia');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [incidentId, user])
  );

  const handleAddComment = async () => {
    if (!user || !commentText.trim() || incident?.status === 'RESOLVED') return;
    setSubmitting(true);
    try {
      const newComment = await addIncidentComment(
        incidentId,
        { text: commentText.trim(), author: { id: user.id } },
        user.token,
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo añadir el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!user) return;
    setResolving(true);
    try {
      await resolveIncident(incidentId, user.token);
      if (user.role === 'ADMIN') {
        navigation.navigate('AdminIncidents');
      } else {
        navigation.navigate('MyIncidents');
      }
    } catch (err) {
      console.error('Error al resolver la incidencia:', err);
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteIncident(incidentId, user.token);
      if (user.role === 'ADMIN') {
        navigation.navigate('AdminIncidents');
      } else {
        navigation.navigate('MyIncidents');
      }
    } catch (err) {
      console.error('Error al eliminar la incidencia:', err);
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const renderHeader = () => {
    if (!incident) return null;
    const statusCfg = STATUS_CONFIG[incident.status];

    return (
      <View style={styles.detailContainer}>
        {/* Insignia de estado */}
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.color + '20' }]}>
          <Ionicons name={statusCfg.icon} size={16} color={statusCfg.color} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>

        {/* Título */}
        <Text style={styles.incidentTitle}>{incident.title}</Text>

        {/* Descripción */}
        <Text style={styles.incidentDescription}>{incident.description}</Text>

        {/* Filas de información */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{TYPE_LABELS[incident.type] || incident.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>
              {isReceived ? 'Enviada por:' : 'Creada por:'}
            </Text>
            <Text style={styles.infoValue}>{incident.user?.name || '—'}</Text>
          </View>

          {incident.relatedItem && (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="cube" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Objeto:</Text>
                <Text style={styles.infoValue}>{incident.relatedItem.title}</Text>
              </View>
              {incident.relatedItem.owner && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-circle" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoLabel}>Propietario:</Text>
                  <Text style={styles.infoValue}>{incident.relatedItem.owner.name}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Encabezado de comentarios */}
        <View style={styles.commentsHeader}>
          <Ionicons name="chatbubbles" size={20} color={Colors.textPrimary} />
          <Text style={styles.commentsTitle}>
            Comentarios ({comments.length})
          </Text>
        </View>
      </View>
    );
  };

  const renderComment = ({ item }: { item: IncidentCommentResponse }) => {
    const isOwn = user?.id === item.author.id;
    return (
      <View style={[styles.commentBubble, isOwn && styles.commentBubbleOwn]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentAuthor, isOwn && styles.commentAuthorOwn]}>
            {isOwn ? 'Tú' : item.author.name}
          </Text>
          <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    );
  };

  const renderEmptyComments = () => {
    if (incident?.status === 'RESOLVED') return null;
    return (
      <View style={styles.emptyComments}>
        <Ionicons name="chatbubble" size={48} color={Colors.textLight} />
        <Text style={styles.emptyCommentsText}>No hay comentarios todavía</Text>
        <Text style={styles.emptyCommentsSubtext}>Sé el primero en comentar</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Detalle</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Detalle</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={commonStyles.centerContent}>
          <View style={commonStyles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={commonStyles.errorText}>{error || 'Incidencia no encontrada'}</Text>
          </View>
          <TouchableOpacity
            style={[commonStyles.primaryButton, { marginTop: Spacing.lg }]}
            onPress={loadData}
          >
            <Text style={commonStyles.primaryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Cabecera */}
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle} numberOfLines={1}>
          {isReceived ? 'Incidencia recibida' : 'Mi incidencia'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComments}
          contentContainerStyle={styles.listContent}
        />

        {/* Campo de comentario — oculto para incidencias resueltas */}
        {incident.status !== 'RESOLVED' && (
          <View style={styles.commentInputContainer}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              placeholderTextColor={Colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.textWhite} />
              ) : (
                <Ionicons name="send" size={20} color={Colors.textWhite} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Botones de acción — solo para incidencias enviadas no resueltas */}
        {!isReceived && incident.status !== 'RESOLVED' && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.resolveButton, resolving && styles.buttonDisabled]}
              onPress={() => { setShowResolveModal(true); }}
              disabled={resolving}
              activeOpacity={0.7}
            >
              {resolving ? (
                <ActivityIndicator size="small" color={Colors.success} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.resolveButtonText}>Marcar resuelta</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.buttonDisabled, styles.deleteButtonHalf]}
              onPress={() => { setShowDeleteModal(true); }}
              disabled={deleting}
              activeOpacity={0.7}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color={Colors.error} />
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Modal confirmar resolver */}
        <Modal
          visible={showResolveModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResolveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>¿Marcar como resuelta?</Text>
              <Text style={styles.modalMessage}>Esta acción cerrará la incidencia y no se podrán añadir más comentarios.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowResolveModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmButton, { backgroundColor: Colors.success }]}
                  onPress={() => {
                    setShowResolveModal(false);
                    void handleResolve();
                  }}
                >
                  <Text style={styles.modalConfirmText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal confirmar eliminar */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="trash" size={48} color={Colors.error} style={styles.modalIcon} />
              <Text style={styles.modalTitle}>¿Eliminar incidencia?</Text>
              <Text style={styles.modalMessage}>Esta acción es irreversible. Se eliminarán también todos los comentarios asociados.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmButton, { backgroundColor: Colors.error }]}
                  onPress={() => {
                    setShowDeleteModal(false);
                    void handleDelete();
                  }}
                >
                  <Text style={styles.modalConfirmText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: Spacing.lg,
  },
  detailContainer: {
    padding: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.base,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as '600',
  },
  incidentTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  incidentDescription: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  infoSection: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    gap: Spacing.base,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium as '500',
  },
  infoValue: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold as '600',
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    flex: 1,
  },
  deleteButtonHalf: {
    flex: 1,
  },
  deleteButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.error,
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
  },
  resolveButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.success,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
  },
  commentBubble: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  commentBubbleOwn: {
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  commentAuthor: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textPrimary,
  },
  commentAuthorOwn: {
    color: Colors.primary,
  },
  commentDate: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  commentText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyCommentsText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium as '500',
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  emptyCommentsSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.base,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold as '600',
    color: Colors.textWhite,
  },
});

export default IncidentDetailScreen;
