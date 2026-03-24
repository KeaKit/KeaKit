import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { createRating } from '../../services/ratingService';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, commonStyles } from '../../styles';

type CreateRatingNav = NativeStackNavigationProp<RootStackParamList, 'CreateRating'>;
type CreateRatingRoute = RouteProp<RootStackParamList, 'CreateRating'>;

const CreateRatingScreen: React.FC = () => {
  const navigation = useNavigation<CreateRatingNav>();
  const route = useRoute<CreateRatingRoute>();
  const { user } = useAuth();
  const { kitId, revieweeId, revieweeName } = route.params;

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (score === 0) {
      setError('Por favor, selecciona una puntuación');
      return;
    }

    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await createRating(
        {
          revieweeId,
          kitId,
          score,
          comment: comment.trim() || undefined,
        },
        user.token,
      );
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la valoración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Valorar</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[commonStyles.screenPadding, styles.content]}>
        <Text style={styles.revieweeLabel}>Valorando a</Text>
        <Text style={styles.revieweeName}>{revieweeName}</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setScore(star)}>
              <Ionicons
                name={star <= score ? 'star' : 'star-outline'}
                size={40}
                color={Colors.warning}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[commonStyles.input, styles.commentInput]}
          placeholder="Escribe un comentario (opcional)"
          placeholderTextColor={Colors.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />

        {error ? (
          <View style={commonStyles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={commonStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[commonStyles.primaryButton, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Enviar Valoración</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  revieweeLabel: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  revieweeName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  commentInput: {
    height: 120,
    marginBottom: Spacing.base,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateRatingScreen;
